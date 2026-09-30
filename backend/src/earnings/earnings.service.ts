import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Injectable()
export class EarningsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto, courierId?: string) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (courierId) where.courierId = courierId;

    const [earnings, total] = await Promise.all([
      this.prisma.courierEarning.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          courier: {
            include: { user: { select: { id: true, name: true, phone: true } } },
          },
          order: {
            select: { id: true, orderNumber: true, deliveryFee: true, codAmount: true },
          },
        },
      }),
      this.prisma.courierEarning.count({ where }),
    ]);

    // Aggregate totals
    const agg = await this.prisma.courierEarning.aggregate({
      where,
      _sum: { totalEarning: true, baseFee: true, bonus: true },
    });

    return {
      data: earnings,
      summary: {
        totalEarnings: Number(agg._sum.totalEarning || 0),
        totalBaseFees: Number(agg._sum.baseFee || 0),
        totalBonuses: Number(agg._sum.bonus || 0),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async settleEarning(earningId: string) {
    const earning = await this.prisma.courierEarning.findUnique({
      where: { id: earningId },
    });

    if (!earning) throw new NotFoundException('Earning record not found.');

    return this.prisma.courierEarning.update({
      where: { id: earningId },
      data: {
        isSettled: true,
        settledAt: new Date(),
      },
    });
  }
}
