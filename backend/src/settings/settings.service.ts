import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export interface CreatePricingRuleDto {
  name: string;
  minDistanceKm: number;
  maxDistanceKm: number;
  basePrice: number;
  courierCutPercentage: number;
  fixedCourierCut?: number;
  isActive?: boolean;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPricingRules() {
    return this.prisma.pricingRule.findMany({
      orderBy: { minDistanceKm: 'asc' },
    });
  }

  async createPricingRule(dto: CreatePricingRuleDto) {
    return this.prisma.pricingRule.create({
      data: dto,
    });
  }

  async updatePricingRule(id: string, dto: Partial<CreatePricingRuleDto>) {
    const existing = await this.prisma.pricingRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pricing rule not found.');

    return this.prisma.pricingRule.update({
      where: { id },
      data: dto,
    });
  }

  async getAllSettings() {
    const settings = await this.prisma.appSetting.findMany();
    const map: Record<string, any> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    return map;
  }

  async updateSetting(key: string, value: any, description?: string) {
    return this.prisma.appSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }
}
