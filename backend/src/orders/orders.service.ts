import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { AuditService } from '../audit/audit.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AssignOrderDto, CancelOrderDto, VerifyDeliveryDto, UpdateOrderStatusDto } from './dto/order-actions.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { validateStatusTransition } from './order-state-machine';
import {
  OrderStatus,
  CourierStatus,
  CollectionStatus,
  ProofType,
  RoleType,
} from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly audit: AuditService,
  ) {}

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.order.count();
    const sequence = String(count + 1).padStart(6, '0');
    return `FM-${year}-${sequence}`;
  }

  async create(dto: CreateOrderDto, creatorId?: string) {
    // 1. Resolve or create customer
    let customerId = dto.customerId;
    if (!customerId) {
      if (!dto.customerPhone || !dto.customerName) {
        throw new BadRequestException('Either customerId or (customerName and customerPhone) must be provided.');
      }
      let customer = await this.prisma.customer.findUnique({
        where: { phone: dto.customerPhone.trim() },
      });
      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            name: dto.customerName.trim(),
            phone: dto.customerPhone.trim(),
            addresses: {
              create: {
                label: 'Delivery Address',
                address: dto.deliveryAddress,
                latitude: dto.deliveryLatitude,
                longitude: dto.deliveryLongitude,
                isDefault: true,
              },
            },
          },
        });
      }
      customerId = customer.id;
    }

    // 2. Compute distance & pricing if fee not explicitly given
    const distanceKm = this.calculateDistanceKm(
      dto.pickupLatitude,
      dto.pickupLongitude,
      dto.deliveryLatitude,
      dto.deliveryLongitude,
    );

    let calculatedFee = dto.deliveryFee;
    if (calculatedFee === undefined || calculatedFee === null) {
      const rule = await this.prisma.pricingRule.findFirst({
        where: {
          isActive: true,
          minDistanceKm: { lte: distanceKm },
          maxDistanceKm: { gte: distanceKm },
        },
      });
      calculatedFee = rule ? Number(rule.basePrice) : Math.max(40, Math.round(distanceKm * 6));
    }

    const orderNumber = await this.generateOrderNumber();
    const trackingToken = `trk_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const otpCode = String(1000 + Math.floor(Math.random() * 9000));
    const hashedOtp = await argon2.hash(otpCode);

    // 3. Database transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          trackingToken,
          customerId,
          pickupName: dto.pickupName,
          pickupPhone: dto.pickupPhone,
          pickupAddress: dto.pickupAddress,
          pickupLatitude: dto.pickupLatitude,
          pickupLongitude: dto.pickupLongitude,
          deliveryAddress: dto.deliveryAddress,
          deliveryLatitude: dto.deliveryLatitude,
          deliveryLongitude: dto.deliveryLongitude,
          packageDescription: dto.packageDescription,
          packageType: dto.packageType || 'STANDARD',
          packageWeight: dto.packageWeight,
          deliveryFee: calculatedFee,
          codAmount: dto.codAmount || 0,
          paymentMethod: dto.paymentMethod || 'COD',
          priority: dto.priority || 'NORMAL',
          notes: dto.notes,
          dispatcherId: creatorId,
          status: OrderStatus.NEW,
          deliveryOtp: {
            create: {
              otpHash: hashedOtp,
              plainOtpForDev: otpCode, // accessible to dispatcher/customer
              expiresAt: new Date(Date.now() + 24 * 3600000),
            },
          },
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: OrderStatus.NEW,
              changedById: creatorId,
              reason: 'Order created',
            },
          },
        },
        include: {
          customer: true,
          deliveryOtp: true,
        },
      });

      return createdOrder;
    });

    await this.audit.log({
      userId: creatorId,
      action: 'ORDER_CREATED',
      entityType: 'ORDER',
      entityId: order.id,
      details: { orderNumber: order.orderNumber, deliveryFee: calculatedFee, codAmount: dto.codAmount },
    });

    this.eventsGateway.emitOrderCreated(order);

    // 4. Manual courier assignment or auto assignment
    if (dto.courierId) {
      return this.assignOrder(order.id, { courierId: dto.courierId }, creatorId);
    }

    return order;
  }

  async findAll(query: PaginationQueryDto, filters?: { status?: OrderStatus; courierId?: string; customerId?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.courierId) where.courierId = filters.courierId;
    if (filters?.customerId) where.customerId = filters.customerId;

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { orderNumber: { contains: s, mode: 'insensitive' } },
        { pickupName: { contains: s, mode: 'insensitive' } },
        { customer: { name: { contains: s, mode: 'insensitive' } } },
        { customer: { phone: { contains: s, mode: 'insensitive' } } },
        { courier: { user: { name: { contains: s, mode: 'insensitive' } } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          courier: {
            include: {
              user: { select: { id: true, name: true, phone: true } },
            },
          },
          cashCollection: true,
          earning: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        courier: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        dispatcher: {
          select: { id: true, name: true, phone: true, email: true },
        },
        assignments: {
          include: {
            courier: {
              include: { user: { select: { name: true, phone: true } } },
            },
            assignedBy: { select: { name: true } },
          },
          orderBy: { assignedAt: 'desc' },
        },
        statusHistory: {
          include: {
            changedBy: { select: { name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        deliveryOtp: {
          select: {
            isVerified: true,
            attempts: true,
            expiresAt: true,
            plainOtpForDev: true,
          },
        },
        deliveryProofs: true,
        cashCollection: true,
        earning: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    return order;
  }

  async assignOrder(orderId: string, dto: AssignOrderDto, assignedById?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found.`);
    }

    if (([OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.RETURNED] as OrderStatus[]).includes(order.status)) {
      throw new BadRequestException(`Cannot assign order currently in ${order.status} state.`);
    }

    const courier = await this.prisma.courier.findUnique({
      where: { id: dto.courierId },
      include: { user: true },
    });

    if (!courier) {
      throw new NotFoundException(`Courier with ID ${dto.courierId} not found.`);
    }

    if (courier.status === CourierStatus.OFFLINE) {
      throw new BadRequestException('Courier is currently OFFLINE.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Update order
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          courierId: courier.id,
          status: OrderStatus.ASSIGNED,
          assignedAt: new Date(),
        },
      });

      // 2. Record assignment
      await tx.orderAssignment.create({
        data: {
          orderId: orderId,
          courierId: courier.id,
          assignedById: assignedById,
          assignedAt: new Date(),
        },
      });

      // 3. Mark courier BUSY
      await tx.courier.update({
        where: { id: courier.id },
        data: { status: CourierStatus.BUSY },
      });

      // 4. Record history
      await tx.orderStatusHistory.create({
        data: {
          orderId: orderId,
          fromStatus: order.status,
          toStatus: OrderStatus.ASSIGNED,
          changedById: assignedById,
          reason: `Assigned to courier ${courier.user.name}`,
        },
      });

      return ord;
    });

    await this.audit.log({
      userId: assignedById,
      action: 'ORDER_ASSIGNED',
      entityType: 'ORDER',
      entityId: orderId,
      details: { courierId: courier.id, courierName: courier.user.name },
    });

    this.eventsGateway.emitOrderAssigned(orderId, courier.id, {
      orderId,
      orderNumber: order.orderNumber,
      courierId: courier.id,
      courierName: courier.user.name,
      status: OrderStatus.ASSIGNED,
    });

    return updated;
  }

  async courierAccept(orderId: string, courierUserId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { courier: true },
    });

    if (!order) throw new NotFoundException('Order not found.');
    if (order.courier?.userId !== courierUserId) {
      throw new ForbiddenException('You are not assigned to this order.');
    }

    validateStatusTransition(order.status, OrderStatus.COURIER_ACCEPTED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.COURIER_ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      await tx.orderAssignment.updateMany({
        where: { orderId: orderId, courierId: order.courierId, acceptedAt: null },
        data: { acceptedAt: new Date() },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: orderId,
          fromStatus: order.status,
          toStatus: OrderStatus.COURIER_ACCEPTED,
          changedById: courierUserId,
          reason: 'Courier accepted delivery assignment',
        },
      });

      return ord;
    });

    this.eventsGateway.emitOrderAccepted(orderId, {
      orderId,
      orderNumber: order.orderNumber,
      courierId: order.courierId,
      status: OrderStatus.COURIER_ACCEPTED,
    });

    return updated;
  }

  async courierReject(orderId: string, courierUserId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { courier: true },
    });

    if (!order) throw new NotFoundException('Order not found.');
    if (order.courier?.userId !== courierUserId) {
      throw new ForbiddenException('You are not assigned to this order.');
    }

    await this.prisma.$transaction(async (tx) => {
      // Revert order to NEW
      await tx.order.update({
        where: { id: orderId },
        data: {
          courierId: null,
          status: OrderStatus.NEW,
          assignedAt: null,
        },
      });

      // Update assignment record with rejection
      await tx.orderAssignment.updateMany({
        where: { orderId, courierId: order.courierId, acceptedAt: null },
        data: {
          rejectedAt: new Date(),
          rejectionReason: reason || 'Courier declined assignment',
        },
      });

      // Set courier back to AVAILABLE
      await tx.courier.update({
        where: { id: order.courierId },
        data: { status: CourierStatus.AVAILABLE },
      });

      // Record history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: OrderStatus.NEW,
          changedById: courierUserId,
          reason: `Rejected by courier: ${reason || 'Declined'}`,
        },
      });
    });

    this.eventsGateway.emitOrderStatusChanged(orderId, {
      orderId,
      status: OrderStatus.NEW,
      message: 'Order rejected by courier and returned to unassigned pool.',
    });

    return { message: 'Order rejected successfully.' };
  }

  async updateCourierOperationalStatus(orderId: string, nextStatus: OrderStatus, courierUserId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { courier: true },
    });

    if (!order) throw new NotFoundException('Order not found.');
    if (order.courier?.userId !== courierUserId) {
      throw new ForbiddenException('You are not assigned to this order.');
    }

    validateStatusTransition(order.status, nextStatus);

    const timestampField: any = {};
    if (nextStatus === OrderStatus.PICKED_UP) timestampField.pickedUpAt = new Date();
    if (nextStatus === OrderStatus.OUT_FOR_DELIVERY) timestampField.outForDeliveryAt = new Date();
    if (nextStatus === OrderStatus.ARRIVED_AT_CUSTOMER) timestampField.arrivedAtCustomerAt = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: nextStatus,
          ...timestampField,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: nextStatus,
          changedById: courierUserId,
          reason: reason || `Courier moved status to ${nextStatus}`,
        },
      });

      return ord;
    });

    this.eventsGateway.emitOrderStatusChanged(orderId, {
      orderId,
      courierId: order.courierId,
      status: nextStatus,
    });

    return updated;
  }

  async verifyAndCompleteDelivery(orderId: string, dto: VerifyDeliveryDto, courierUserId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        courier: true,
        deliveryOtp: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found.');
    if (order.courier?.userId !== courierUserId) {
      throw new ForbiddenException('You are not the assigned courier for this order.');
    }

    if (order.status !== OrderStatus.ARRIVED_AT_CUSTOMER && order.status !== OrderStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestException(`Delivery can only be confirmed after arriving at customer. Current status: ${order.status}`);
    }

    // 1. Verify OTP
    const otpRecord = order.deliveryOtp;
    if (!otpRecord) {
      throw new BadRequestException('Delivery OTP not found for this order.');
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      throw new BadRequestException('Max OTP verification attempts exceeded. Please contact dispatcher.');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('Delivery OTP has expired. Please request a new OTP from dispatcher.');
    }

    const isMatch = await argon2.verify(otpRecord.otpHash, dto.otp.trim());
    if (!isMatch) {
      await this.prisma.deliveryOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException(`Invalid OTP code. Remaining attempts: ${otpRecord.maxAttempts - (otpRecord.attempts + 1)}`);
    }

    // 2. Validate COD
    const expectedCod = Number(order.codAmount);
    const collectedCod = dto.collectedAmount !== undefined ? Number(dto.collectedAmount) : expectedCod;
    const difference = collectedCod - expectedCod;
    const isReconciled = difference === 0;

    if (!isReconciled && !dto.discrepancyReason) {
      throw new BadRequestException(`Collected amount (${collectedCod} EGP) does not match expected COD (${expectedCod} EGP). Please provide an explanation.`);
    }

    // 3. Compute Courier Earnings
    const fee = Number(order.deliveryFee);
    const baseCut = fee * 0.7; // 70% default cut
    const totalEarning = baseCut;

    // 4. Transaction execution
    const completedOrder = await this.prisma.$transaction(async (tx) => {
      // Mark OTP verified
      await tx.deliveryOtp.update({
        where: { id: otpRecord.id },
        data: { isVerified: true },
      });

      // Create Cash Collection record
      await tx.cashCollection.upsert({
        where: { orderId },
        update: {
          collectedAmount: collectedCod,
          difference: difference,
          status: isReconciled ? CollectionStatus.RECONCILED : CollectionStatus.DISCREPANCY,
          discrepancyReason: dto.discrepancyReason,
          reconciledAt: isReconciled ? new Date() : null,
        },
        create: {
          orderId,
          courierId: order.courierId,
          expectedAmount: expectedCod,
          collectedAmount: collectedCod,
          difference: difference,
          status: isReconciled ? CollectionStatus.RECONCILED : CollectionStatus.DISCREPANCY,
          discrepancyReason: dto.discrepancyReason,
          reconciledAt: isReconciled ? new Date() : null,
        },
      });

      // Create Courier Earnings record
      await tx.courierEarning.upsert({
        where: { orderId },
        update: {},
        create: {
          orderId,
          courierId: order.courierId,
          baseFee: baseCut,
          distanceFee: 0,
          bonus: 0,
          totalEarning: totalEarning,
        },
      });

      // Create Proof of Delivery
      await tx.deliveryProof.create({
        data: {
          orderId,
          type: ProofType.OTP,
          fileUrl: dto.photoUrl,
          notes: `Verified via OTP. Signature: ${dto.signatureUrl ? 'Yes' : 'No'}`,
          uploadedById: courierUserId,
        },
      });

      if (dto.photoUrl) {
        await tx.deliveryProof.create({
          data: {
            orderId,
            type: ProofType.PHOTO,
            fileUrl: dto.photoUrl,
            uploadedById: courierUserId,
          },
        });
      }

      // Update Order to DELIVERED
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.DELIVERED,
          deliveredAt: new Date(),
        },
      });

      // Free courier to AVAILABLE
      await tx.courier.update({
        where: { id: order.courierId },
        data: { status: CourierStatus.AVAILABLE },
      });

      // Record status history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: OrderStatus.DELIVERED,
          changedById: courierUserId,
          reason: 'Delivery confirmed and verified by OTP and cash reconciliation.',
        },
      });

      return ord;
    });

    await this.audit.log({
      userId: courierUserId,
      action: 'DELIVERY_CONFIRMED',
      entityType: 'ORDER',
      entityId: orderId,
      details: { collectedAmount: collectedCod, expectedCod, difference },
    });

    this.eventsGateway.emitOrderStatusChanged(orderId, {
      orderId,
      status: OrderStatus.DELIVERED,
      courierId: order.courierId,
      deliveredAt: completedOrder.deliveredAt,
    });

    return completedOrder;
  }

  async cancelOrder(orderId: string, dto: CancelOrderDto, userId?: string, userRoles?: RoleType[]) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { courier: true },
    });

    if (!order) throw new NotFoundException('Order not found.');
    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel an already delivered order.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      if (order.courierId) {
        await tx.courier.update({
          where: { id: order.courierId },
          data: { status: CourierStatus.AVAILABLE },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: OrderStatus.CANCELLED,
          changedById: userId,
          reason: dto.reason,
        },
      });

      return ord;
    });

    await this.audit.log({
      userId,
      action: 'ORDER_CANCELLED',
      entityType: 'ORDER',
      entityId: orderId,
      details: { reason: dto.reason },
    });

    this.eventsGateway.emitOrderCancelled(orderId, {
      orderId,
      courierId: order.courierId,
      reason: dto.reason,
    });

    return updated;
  }
}
