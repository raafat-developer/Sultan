import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { OrderStatus } from '@prisma/client';

export interface CreateCustomerDto {
  name: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  notes?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { phone: dto.phone.trim() },
    });
    if (existing) {
      throw new ConflictException(`Customer with phone ${dto.phone} already exists.`);
    }

    return this.prisma.customer.create({
      data: {
        name: dto.name.trim(),
        phone: dto.phone.trim(),
        secondaryPhone: dto.secondaryPhone?.trim(),
        email: dto.email?.trim(),
        notes: dto.notes,
        addresses: dto.address
          ? {
              create: {
                label: 'Primary',
                address: dto.address,
                latitude: dto.latitude,
                longitude: dto.longitude,
                isDefault: true,
              },
            }
          : undefined,
      },
      include: { addresses: true },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          addresses: true,
          _count: { select: { orders: true } },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          take: 15,
          orderBy: { createdAt: 'desc' },
          include: {
            courier: { include: { user: { select: { name: true, phone: true } } } },
          },
        },
      },
    });

    if (!customer) throw new NotFoundException(`Customer ${id} not found.`);

    // Calculate customer metrics
    const stats = await this.prisma.order.groupBy({
      by: ['status'],
      where: { customerId: id },
      _count: { status: true },
      _sum: { codAmount: true, deliveryFee: true },
    });

    let deliveredCount = 0;
    let cancelledCount = 0;
    let failedCount = 0;
    let totalSpending = 0;

    stats.forEach((st) => {
      if (st.status === OrderStatus.DELIVERED) {
        deliveredCount += st._count.status;
        totalSpending += Number(st._sum.codAmount || 0) + Number(st._sum.deliveryFee || 0);
      } else if (st.status === OrderStatus.CANCELLED) {
        cancelledCount += st._count.status;
      } else if (st.status === OrderStatus.FAILED_DELIVERY) {
        failedCount += st._count.status;
      }
    });

    return {
      ...customer,
      analytics: {
        totalOrders: customer.orders.length,
        delivered: deliveredCount,
        cancelled: cancelledCount,
        failed: failedCount,
        totalSpending,
        lastOrder: customer.orders[0] || null,
      },
    };
  }
}
