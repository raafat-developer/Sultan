import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Public()
  @Get('public/:token')
  @ApiOperation({ summary: 'Public secure order tracking for customers without login' })
  async getPublicTracking(@Param('token') token: string) {
    return this.trackingService.getCustomerPublicTracking(token);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DISPATCHER)
  @Get('couriers/live')
  @ApiOperation({ summary: 'Admin Live Fleet Map tracking with real-time GPS locations and active assignments' })
  async getAdminLiveTracking() {
    return this.trackingService.getAdminLiveTracking();
  }
}
