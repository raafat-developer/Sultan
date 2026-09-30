import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Reports & Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DISPATCHER)
  @ApiOperation({ summary: 'Executive analytics: Total orders, Delivered, Revenue, COD, Earnings, Profit' })
  @ApiQuery({ name: 'range', required: false, enum: ['today', 'week', 'month', 'custom'] })
  async getSummary(
    @Query('range') range?: string,
    @Query('from') fromDate?: string,
    @Query('to') toDate?: string,
  ) {
    return this.reportsService.getExecutiveSummary(range, fromDate, toDate);
  }
}
