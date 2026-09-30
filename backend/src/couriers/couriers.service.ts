import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { EventsGateway } from '../events/events.gateway';
import { AuditService } from '../audit/audit.service';
import { UpdateCourierStatusDto, UpdateLocationDto, UpdateCourierProfileDto } from './dto/courier.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CourierStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class CouriersService {
  private readonly logger = new Logger(CouriersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly eventsGateway: EventsGateway,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: PaginationQueryDto, status?: CourierStatus) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { user: { name: { contains: s, mode: 'insensitive' } } },
        { user: { phone: { contains: s, mode: 'insensitive' } } },
        { plateNumber: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [couriers, total] = await Promise.all([
      this.prisma.courier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { status: 'asc' },
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true, isActive: true },
          },
          orders: {
            where: {
              status: {
                in: [
                  OrderStatus.ASSIGNED,
                  OrderStatus.COURIER_ACCEPTED,
                  OrderStatus.GOING_TO_PICKUP,
                  OrderStatus.ARRIVED_AT_PICKUP,
                  OrderStatus.PICKED_UP,
                  OrderStatus.OUT_FOR_DELIVERY,
                  OrderStatus.ARRIVED_AT_CUSTOMER,
                ],
              },
            },
            select: { id: true, orderNumber: true, status: true },
          },
        },
      }),
      this.prisma.courier.count({ where }),
    ]);

    return {
      data: couriers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const courier = await this.prisma.courier.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, isActive: true } },
        earnings: { take: 10, orderBy: { createdAt: 'desc' } },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { name: true, phone: true } } },
        },
      },
    });

    if (!courier) {
      throw new NotFoundException(`Courier ${id} not found.`);
    }

    // Enhance with latest real-time location from Redis
    const cachedLocation = await this.redis.getCourierLocation(courier.id);
    return {
      ...courier,
      latestLocation: cachedLocation || {
        lat: courier.currentLatitude,
        lng: courier.currentLongitude,
        updatedAt: courier.lastLocationUpdate,
        battery: courier.batteryLevel,
      },
    };
  }

  async updateStatus(courierUserId: string, dto: UpdateCourierStatusDto) {
    const courier = await this.prisma.courier.findUnique({
      where: { userId: courierUserId },
      include: { user: true },
    });

    if (!courier) throw new NotFoundException('Courier profile not found for user.');

    // If courier has active delivery and tries to go OFFLINE, warn or disallow
    if (dto.status === CourierStatus.OFFLINE) {
      const activeCount = await this.prisma.order.count({
        where: {
          courierId: courier.id,
          status: {
            in: [
              OrderStatus.COURIER_ACCEPTED,
              OrderStatus.GOING_TO_PICKUP,
              OrderStatus.ARRIVED_AT_PICKUP,
              OrderStatus.PICKED_UP,
              OrderStatus.OUT_FOR_DELIVERY,
              OrderStatus.ARRIVED_AT_CUSTOMER,
            ],
          },
        },
      });

      if (activeCount > 0) {
        throw new BadRequestException('Cannot go offline while you have active deliveries in progress.');
      }
    }

    const updated = await this.prisma.courier.update({
      where: { id: courier.id },
      data: { status: dto.status },
    });

    await this.audit.log({
      userId: courierUserId,
      action: 'COURIER_STATUS_CHANGED',
      entityType: 'COURIER',
      entityId: courier.id,
      details: { previousStatus: courier.status, newStatus: dto.status },
    });

    this.eventsGateway.emitCourierStatus(courier.id, dto.status, {
      courierName: courier.user.name,
      batteryLevel: courier.batteryLevel,
    });

    return updated;
  }

  async updateLocation(courierUserId: string, dto: UpdateLocationDto) {
    const courier = await this.prisma.courier.findUnique({
      where: { userId: courierUserId },
    });

    if (!courier) throw new NotFoundException('Courier not found.');

    const now = new Date();

    // 1. Update fast Redis location cache
    await this.redis.setCourierLocation(courier.id, {
      lat: dto.latitude,
      lng: dto.longitude,
      battery: dto.batteryLevel,
      updatedAt: now.toISOString(),
    });

    // 2. Persist in Courier table
    await this.prisma.courier.update({
      where: { id: courier.id },
      data: {
        currentLatitude: dto.latitude,
        currentLongitude: dto.longitude,
        lastLocationUpdate: now,
        batteryLevel: dto.batteryLevel,
      },
    });

    // 3. Persist location history if active delivery is in progress
    if (dto.activeOrderId) {
      await this.prisma.courierLocation.create({
        data: {
          courierId: courier.id,
          latitude: dto.latitude,
          longitude: dto.longitude,
          accuracy: dto.accuracy,
          heading: dto.heading,
          speed: dto.speed,
          batteryLevel: dto.batteryLevel,
          timestamp: now,
        },
      });
    }

    // 4. Emit real-time tracking event via Socket.IO
    this.eventsGateway.emitCourierLocation(courier.id, {
      latitude: dto.latitude,
      longitude: dto.longitude,
      accuracy: dto.accuracy,
      heading: dto.heading,
      speed: dto.speed,
      batteryLevel: dto.batteryLevel,
      orderId: dto.activeOrderId,
      timestamp: now.toISOString(),
    });

    return { success: true, timestamp: now };
  }

  async getCourierStats(courierUserId: string) {
    const courier = await this.prisma.courier.findUnique({
      where: { userId: courierUserId },
    });
    if (!courier) throw new NotFoundException('Courier not found.');

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todayCompleted, todayPending, todayEarningsAgg, currentDelivery] = await Promise.all([
      this.prisma.order.count({
        where: {
          courierId: courier.id,
          status: OrderStatus.DELIVERED,
          deliveredAt: { gte: startOfDay },
        },
      }),
      this.prisma.order.count({
        where: {
          courierId: courier.id,
          status: {
            in: [
              OrderStatus.ASSIGNED,
              OrderStatus.COURIER_ACCEPTED,
              OrderStatus.GOING_TO_PICKUP,
              OrderStatus.ARRIVED_AT_PICKUP,
              OrderStatus.PICKED_UP,
              OrderStatus.OUT_FOR_DELIVERY,
              OrderStatus.ARRIVED_AT_CUSTOMER,
            ],
          },
        },
      }),
      this.prisma.courierEarning.aggregate({
        where: {
          courierId: courier.id,
          createdAt: { gte: startOfDay },
        },
        _sum: { totalEarning: true },
      }),
      this.prisma.order.findFirst({
        where: {
          courierId: courier.id,
          status: {
            in: [
              OrderStatus.ASSIGNED,
              OrderStatus.COURIER_ACCEPTED,
              OrderStatus.GOING_TO_PICKUP,
              OrderStatus.ARRIVED_AT_PICKUP,
              OrderStatus.PICKED_UP,
              OrderStatus.OUT_FOR_DELIVERY,
              OrderStatus.ARRIVED_AT_CUSTOMER,
            ],
          },
        },
        include: {
          customer: true,
          deliveryOtp: {
            select: { plainOtpForDev: true, isVerified: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      status: courier.status,
      todayOrders: todayCompleted + todayPending,
      completedToday: todayCompleted,
      pendingToday: todayPending,
      todayEarnings: Number(todayEarningsAgg._sum.totalEarning || 0),
      currentDelivery,
    };
  }

  async updateProfile(id: string, dto: UpdateCourierProfileDto) {
    return this.prisma.courier.update({
      where: { id },
      data: dto,
    });
  }
}
