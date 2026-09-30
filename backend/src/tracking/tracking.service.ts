import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { CourierStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class TrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getAdminLiveTracking() {
    const couriers = await this.prisma.courier.findMany({
      include: {
        user: { select: { id: true, name: true, phone: true } },
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
          select: {
            id: true,
            orderNumber: true,
            status: true,
            pickupName: true,
            deliveryAddress: true,
            codAmount: true,
          },
        },
      },
    });

    const activeList = await Promise.all(
      couriers.map(async (c) => {
        const cached = await this.redis.getCourierLocation(c.id);
        const lat = cached?.lat ?? c.currentLatitude;
        const lng = cached?.lng ?? c.currentLongitude;
        const updatedAt = cached?.updatedAt ?? c.lastLocationUpdate;

        return {
          id: c.id,
          name: c.user.name,
          phone: c.user.phone,
          status: c.status,
          vehicleType: c.vehicleType,
          plateNumber: c.plateNumber,
          batteryLevel: cached?.battery ?? c.batteryLevel,
          currentOrder: c.orders[0] || null,
          location: lat && lng ? { latitude: lat, longitude: lng, updatedAt } : null,
        };
      }),
    );

    return activeList;
  }

  async getCustomerPublicTracking(token: string) {
    const order = await this.prisma.order.findUnique({
      where: { trackingToken: token },
      include: {
        courier: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
        statusHistory: {
          select: {
            toStatus: true,
            createdAt: true,
            reason: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Invalid or expired tracking code.');
    }

    // Mask courier phone for privacy e.g. +2010****0011
    let maskedPhone: string | null = null;
    let courierLiveLocation: any = null;

    if (order.courier) {
      const phone = order.courier.user.phone;
      if (phone.length > 6) {
        maskedPhone = phone.substring(0, 5) + '****' + phone.substring(phone.length - 2);
      }

      // If out for delivery, include live location
      if (order.status === OrderStatus.OUT_FOR_DELIVERY || order.status === OrderStatus.ARRIVED_AT_CUSTOMER) {
        const cached = await this.redis.getCourierLocation(order.courier.id);
        courierLiveLocation = cached
          ? { latitude: cached.lat, longitude: cached.lng }
          : order.courier.currentLatitude && order.courier.currentLongitude
          ? { latitude: order.courier.currentLatitude, longitude: order.courier.currentLongitude }
          : null;
      }
    }

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      packageDescription: order.packageDescription,
      pickupName: order.pickupName,
      deliveryAddress: order.deliveryAddress,
      deliveryLatitude: order.deliveryLatitude,
      deliveryLongitude: order.deliveryLongitude,
      codAmount: Number(order.codAmount),
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      courier: order.courier
        ? {
            name: order.courier.user.name.split(' ')[0], // only first name
            phone: maskedPhone,
            vehicle: order.courier.vehicleType,
            location: courierLiveLocation,
          }
        : null,
      timeline: order.statusHistory,
    };
  }
}
