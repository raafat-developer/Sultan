import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService, CreateCustomerDto } from './customers.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DISPATCHER)
  @ApiOperation({ summary: 'List customers with order count and search' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.customersService.findAll(query);
  }

  @Post()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DISPATCHER)
  @ApiOperation({ summary: 'Create new customer' })
  async create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DISPATCHER)
  @ApiOperation({ summary: 'Get customer details, address list, and ordering metrics' })
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }
}
