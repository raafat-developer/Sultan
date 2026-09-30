import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CollectionStatus } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getCashCollections(query: PaginationQueryDto, status?: CollectionStatus, courierId?: string) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (courierId) where.courierId = courierId;

    const [collections, total] = await Promise.all([
      this.prisma.cashCollection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          courier: {
            include: { user: { select: { id: true, name: true, phone: true } } },
          },
          order: {
            select: { id: true, orderNumber: true, deliveryAddress: true, deliveryFee: true },
          },
        },
      }),
      this.prisma.cashCollection.count({ where }),
    ]);

    return {
      data: collections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async reconcileCollection(collectionId: string, adminUserId: string, notes?: string) {
    const collection = await this.prisma.cashCollection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(`Cash collection record ${collectionId} not found.`);
    }

    const updated = await this.prisma.cashCollection.update({
      where: { id: collectionId },
      data: {
        status: CollectionStatus.RECONCILED,
        reconciledById: adminUserId,
        reconciledAt: new Date(),
        discrepancyReason: notes ? `${collection.discrepancyReason || ''} | Reconciled: ${notes}` : collection.discrepancyReason,
      },
    });

    await this.audit.log({
      userId: adminUserId,
      action: 'COD_RECONCILED',
      entityType: 'CASH_COLLECTION',
      entityId: collectionId,
      details: { collected: collection.collectedAmount, expected: collection.expectedAmount, notes },
    });

    return updated;
  }
}
