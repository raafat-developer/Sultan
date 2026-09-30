import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouriersService } from './couriers.service';
import { UpdateCourierStatusDto, UpdateLocationDto, UpdateCourierProfileDto } from './dto/courier.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RoleType, CourierStatus } from '@prisma/client';

@ApiTags('Couriers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('couriers')
export class CouriersController {
  constructor(private readonly couriersService: CouriersService) {}

  @Get()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DISPATCHER)
  @ApiOperation({ summary: 'List all couriers with status, active orders, and filters' })
  async findAll(
    @Query() query: PaginationQueryDto,
    @Query('status') status?: CourierStatus,
  ) {
    return this.couriersService.findAll(query, status);
  }

  @Get('me/stats')
  @Roles(RoleType.COURIER)
  @ApiOperation({ summary: 'Get current courier dashboard stats: online state, orders today, earnings, active delivery' })
  async getMyStats(@CurrentUser('id') userId: string) {
    return this.couriersService.getCourierStats(userId);
  }

  @Post('status')
  @Roles(RoleType.COURIER)
  @ApiOperation({ summary: 'Toggle courier availability (AVAILABLE, OFFLINE)' })
  async updateStatus(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCourierStatusDto,
  ) {
    return this.couriersService.updateStatus(userId, dto);
  }

  @Post('location')
  @Roles(RoleType.COURIER)
  @ApiOperation({ summary: 'Submit courier GPS location coordinates and telemetry' })
  async updateLocation(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.couriersService.updateLocation(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get courier detail by ID' })
  async findOne(@Param('id') id: string) {
    return this.couriersService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @ApiOperation({ summary: 'Update courier fleet profile' })
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateCourierProfileDto,
  ) {
    return this.couriersService.updateProfile(id, dto);
  }
}
