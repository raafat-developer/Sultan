import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EarningsService } from './earnings.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Earnings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('earnings')
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  @Get()
  @ApiOperation({ summary: 'List earnings history and aggregates (Couriers get own earnings, Admins see fleet)' })
  async getEarnings(
    @Query() query: PaginationQueryDto,
    @Query('courierId') courierId?: string,
    @CurrentUser() user?: any,
  ) {
    const isCourier = user?.roles?.includes(RoleType.COURIER);
    const effectiveCourierId = isCourier ? user.courierId : courierId;
    return this.earningsService.findAll(query, effectiveCourierId);
  }

  @Post(':id/settle')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @ApiOperation({ summary: 'Admin settles courier payout' })
  async settle(@Param('id') id: string) {
    return this.earningsService.settleEarning(id);
  }
}
