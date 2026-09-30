import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService, CreatePricingRuleDto } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Settings & Pricing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('pricing-rules')
  @ApiOperation({ summary: 'Get list of active and tiered pricing rules' })
  async getPricingRules() {
    return this.settingsService.getPricingRules();
  }

  @Post('pricing-rules')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @ApiOperation({ summary: 'Create new distance pricing tier' })
  async createPricingRule(@Body() dto: CreatePricingRuleDto) {
    return this.settingsService.createPricingRule(dto);
  }

  @Patch('pricing-rules/:id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @ApiOperation({ summary: 'Modify pricing rule rates or commissions' })
  async updatePricingRule(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePricingRuleDto>,
  ) {
    return this.settingsService.updatePricingRule(id, dto);
  }

  @Get()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @ApiOperation({ summary: 'Get all global operational settings' })
  async getSettings() {
    return this.settingsService.getAllSettings();
  }

  @Patch(':key')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @ApiOperation({ summary: 'Update system setting key/value' })
  async updateSetting(
    @Param('key') key: string,
    @Body('value') value: any,
    @Body('description') description?: string,
  ) {
    return this.settingsService.updateSetting(key, value, description);
  }
}
