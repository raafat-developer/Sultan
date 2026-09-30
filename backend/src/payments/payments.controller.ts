import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RoleType, CollectionStatus } from '@prisma/client';

@ApiTags('Payments & COD')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('cash-collections')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DISPATCHER)
  @ApiOperation({ summary: 'List Cash on Delivery collections, filter by status or courier' })
  async getCashCollections(
    @Query() query: PaginationQueryDto,
    @Query('status') status?: CollectionStatus,
    @Query('courierId') courierId?: string,
  ) {
    return this.paymentsService.getCashCollections(query, status, courierId);
  }

  @Post('cash-collections/:id/reconcile')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @ApiOperation({ summary: 'Admin confirms COD reconciliation and clears discrepancies' })
  async reconcile(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.paymentsService.reconcileCollection(id, adminUserId, notes);
  }
}
