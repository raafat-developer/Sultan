import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  AssignOrderDto,
  CancelOrderDto,
  VerifyDeliveryDto,
  UpdateOrderStatusDto,
} from './dto/order-actions.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RoleType, OrderStatus } from '@prisma/client';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DISPATCHER)
  @ApiOperation({ summary: 'Create new delivery order' })
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List delivery orders with pagination, search, and filters' })
  async findAll(
    @Query() query: PaginationQueryDto,
    @Query('status') status?: OrderStatus,
    @Query('courierId') courierId?: string,
    @Query('customerId') customerId?: string,
    @CurrentUser() user?: any,
  ) {
    // If courier calls, restrict to their courier ID
    const effectiveCourierId = user?.roles?.includes(RoleType.COURIER) ? user.courierId : courierId;
    return this.ordersService.findAll(query, {
      status,
      courierId: effectiveCourierId,
      customerId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed order timeline, status history, and metadata' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/assign')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DISPATCHER)
  @ApiOperation({ summary: 'Assign or reassign order to a courier' })
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignOrderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.assignOrder(id, dto, userId);
  }

  @Post(':id/accept')
  @Roles(RoleType.COURIER)
  @ApiOperation({ summary: 'Courier accepts assigned delivery' })
  async accept(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.courierAccept(id, userId);
  }

  @Post(':id/reject')
  @Roles(RoleType.COURIER)
  @ApiOperation({ summary: 'Courier declines assigned delivery' })
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.courierReject(id, userId, reason);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update operational delivery state (PICKED_UP, OUT_FOR_DELIVERY, etc.)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') nextStatus: OrderStatus,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.updateCourierOperationalStatus(id, nextStatus, userId, dto.reason);
  }

  @Post(':id/verify-delivery')
  @Roles(RoleType.COURIER)
  @ApiOperation({ summary: 'Verify customer OTP, reconcile COD, upload proof, and complete delivery' })
  async verifyDelivery(
    @Param('id') id: string,
    @Body() dto: VerifyDeliveryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.verifyAndCompleteDelivery(id, dto, userId);
  }

  @Post(':id/cancel')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DISPATCHER)
  @ApiOperation({ summary: 'Cancel order with required reason' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.cancelOrder(id, dto, user.id, user.roles);
  }
}
