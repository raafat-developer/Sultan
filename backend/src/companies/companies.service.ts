import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, RenewLicenseDto, UpdateCompanyStatusDto } from './dto/company.dto';
import { RoleType } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  // In-memory tenant store for resilient dev fallback
  private mockCompanies: any[] = [
    {
      id: 'cmp-fastman-001',
      name: 'FAST MAN Express',
      slug: 'fastman',
      licenseKey: 'FM-LIC-2026-99A1-88FE',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
      logoUrl: null,
      brandColor: '#E50914',
      contactEmail: 'admin@fastman.com',
      contactPhone: '+201000000002',
      address: 'Nasr City, Cairo, Egypt',
      maxCouriers: 100,
      maxOrdersPerMonth: 10000,
      licenseExpiresAt: new Date('2027-12-31T23:59:59.000Z'),
      createdAt: new Date('2026-01-01'),
      couriersCount: 18,
      ordersCount: 1420,
      admins: [{ name: 'Tarek Admin', email: 'admin@fastman.com', phone: '+201000000002' }],
    },
    {
      id: 'cmp-alburaq-002',
      name: 'Al-Buraq Motorcycle Logistics',
      slug: 'alburaq',
      licenseKey: 'BRQ-LIC-2026-44B2-11CD',
      status: 'ACTIVE',
      plan: 'PRO',
      logoUrl: null,
      brandColor: '#00E5FF',
      contactEmail: 'contact@alburaq-delivery.com',
      contactPhone: '+201099887766',
      address: '10 Makram Ebeid, Nasr City, Cairo',
      maxCouriers: 50,
      maxOrdersPerMonth: 5000,
      licenseExpiresAt: new Date('2027-06-30T23:59:59.000Z'),
      createdAt: new Date('2026-02-15'),
      couriersCount: 12,
      ordersCount: 850,
      admins: [{ name: 'Karim Mostafa', email: 'admin@alburaq.com', phone: '+201099887711' }],
    },
    {
      id: 'cmp-speedy-003',
      name: 'Speedy Cairo Delivery',
      slug: 'speedy',
      licenseKey: 'SPD-LIC-2026-88C3-22AB',
      status: 'TRIAL',
      plan: 'STARTER',
      logoUrl: null,
      brandColor: '#FBBF24',
      contactEmail: 'ops@speedycairo.com',
      contactPhone: '+201022334411',
      address: 'Dokki, Giza, Egypt',
      maxCouriers: 15,
      maxOrdersPerMonth: 1000,
      licenseExpiresAt: new Date(Date.now() + 14 * 24 * 3600000), // 14 days trial
      createdAt: new Date(),
      couriersCount: 5,
      ordersCount: 190,
      admins: [{ name: 'Hossam Nabil', email: 'admin@speedycairo.com', phone: '+201022334411' }],
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  private generateLicenseKey(prefix = 'FM'): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = (len = 4) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const year = new Date().getFullYear();
    return `${prefix.toUpperCase()}-LIC-${year}-${segment()}-${segment()}`;
  }

  async findAll(search?: string) {
    if (this.prisma.isConnected) {
      try {
        const where: any = {};
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            { licenseKey: { contains: search, mode: 'insensitive' } },
          ];
        }
        const companies = await this.prisma.company.findMany({
          where,
          include: {
            _count: {
              select: { couriers: true, orders: true, users: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        return companies.map((c) => ({
          ...c,
          couriersCount: c._count.couriers,
          ordersCount: c._count.orders,
        }));
      } catch (err: any) {
        this.logger.warn(`PostgreSQL error in findAll companies, using fallback: ${err.message}`);
      }
    }

    let results = [...this.mockCompanies];
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.slug.toLowerCase().includes(s) ||
          c.licenseKey.toLowerCase().includes(s),
      );
    }
    return results;
  }

  async findOne(idOrSlug: string) {
    if (this.prisma.isConnected) {
      try {
        const company = await this.prisma.company.findFirst({
          where: {
            OR: [{ id: idOrSlug }, { slug: idOrSlug }, { licenseKey: idOrSlug }],
          },
          include: {
            users: {
              select: { id: true, name: true, email: true, phone: true, isActive: true },
            },
            _count: {
              select: { couriers: true, orders: true },
            },
          },
        });
        if (company) {
          return {
            ...company,
            couriersCount: company._count.couriers,
            ordersCount: company._count.orders,
          };
        }
      } catch (err: any) {
        this.logger.warn(`PostgreSQL error in findOne company: ${err.message}`);
      }
    }

    const match = this.mockCompanies.find(
      (c) => c.id === idOrSlug || c.slug === idOrSlug || c.licenseKey === idOrSlug,
    );
    if (!match) throw new NotFoundException(`Company ${idOrSlug} not found.`);
    return match;
  }

  async create(dto: CreateCompanyDto) {
    const cleanSlug = dto.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    const licenseKey = this.generateLicenseKey(cleanSlug.slice(0, 3));
    const duration = dto.durationMonths || 12;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + duration);

    if (this.prisma.isConnected) {
      try {
        const existing = await this.prisma.company.findUnique({ where: { slug: cleanSlug } });
        if (existing) throw new ConflictException(`Company slug '${cleanSlug}' is already taken.`);

        // Hash admin password
        const passwordHash = await argon2.hash(dto.adminPassword);

        // Transaction: Create company + Create Admin User + Assign Role
        const company = await this.prisma.$transaction(async (tx) => {
          const created = await tx.company.create({
            data: {
              name: dto.name.trim(),
              slug: cleanSlug,
              licenseKey,
              logoUrl: dto.logoUrl,
              brandColor: dto.brandColor || '#E50914',
              contactEmail: dto.contactEmail.toLowerCase().trim(),
              contactPhone: dto.contactPhone.trim(),
              address: dto.address,
              plan: dto.plan || 'PRO',
              maxCouriers: dto.maxCouriers || 50,
              licenseExpiresAt: expiresAt,
            },
          });

          // Create Company Admin User
          const adminUser = await tx.user.create({
            data: {
              companyId: created.id,
              name: dto.adminName.trim(),
              email: dto.adminEmail.toLowerCase().trim(),
              phone: dto.adminPhone.trim(),
              passwordHash,
              isActive: true,
            },
          });

          // Find or create ADMIN role
          let role = await tx.role.findUnique({ where: { name: RoleType.ADMIN } });
          if (role) {
            await tx.userRole.create({
              data: { userId: adminUser.id, roleId: role.id },
            });
          }

          return created;
        });

        return {
          ...company,
          message: 'Company onboarded successfully with license generated.',
          adminCredentials: {
            email: dto.adminEmail,
            password: dto.adminPassword,
          },
        };
      } catch (err: any) {
        if (err instanceof ConflictException) throw err;
        this.logger.warn(`PostgreSQL error in create company: ${err.message}`);
      }
    }

    // In-memory creation
    const newCompany = {
      id: `cmp-${cleanSlug}-${Date.now().toString().slice(-4)}`,
      name: dto.name.trim(),
      slug: cleanSlug,
      licenseKey,
      status: 'ACTIVE',
      plan: dto.plan || 'PRO',
      logoUrl: dto.logoUrl || null,
      brandColor: dto.brandColor || '#E50914',
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      address: dto.address || 'Cairo, Egypt',
      maxCouriers: dto.maxCouriers || 50,
      maxOrdersPerMonth: 5000,
      licenseExpiresAt: expiresAt,
      createdAt: new Date(),
      couriersCount: 0,
      ordersCount: 0,
      admins: [
        {
          name: dto.adminName,
          email: dto.adminEmail,
          phone: dto.adminPhone,
        },
      ],
    };

    this.mockCompanies.unshift(newCompany);

    return {
      ...newCompany,
      message: 'Company onboarded successfully with license generated.',
      adminCredentials: {
        email: dto.adminEmail,
        password: dto.adminPassword,
      },
    };
  }

  async update(id: string, dto: UpdateCompanyDto) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.company.update({
          where: { id },
          data: dto,
        });
      } catch (err: any) {
        this.logger.warn(`PostgreSQL error in update company: ${err.message}`);
      }
    }

    const index = this.mockCompanies.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundException(`Company ${id} not found.`);
    this.mockCompanies[index] = { ...this.mockCompanies[index], ...dto, updatedAt: new Date() };
    return this.mockCompanies[index];
  }

  async renewLicense(id: string, dto: RenewLicenseDto) {
    const months = dto.durationMonths || 12;
    if (this.prisma.isConnected) {
      try {
        const company = await this.prisma.company.findUnique({ where: { id } });
        if (!company) throw new NotFoundException('Company not found.');
        const currentExp = new Date(company.licenseExpiresAt) > new Date() ? new Date(company.licenseExpiresAt) : new Date();
        currentExp.setMonth(currentExp.getMonth() + months);

        return await this.prisma.company.update({
          where: { id },
          data: {
            licenseExpiresAt: currentExp,
            status: 'ACTIVE',
            plan: dto.plan || company.plan,
          },
        });
      } catch (err: any) {
        this.logger.warn(`PostgreSQL error in renewLicense: ${err.message}`);
      }
    }

    const index = this.mockCompanies.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundException('Company not found.');
    const comp = this.mockCompanies[index];
    const currentExp = new Date(comp.licenseExpiresAt) > new Date() ? new Date(comp.licenseExpiresAt) : new Date();
    currentExp.setMonth(currentExp.getMonth() + months);
    comp.licenseExpiresAt = currentExp;
    comp.status = 'ACTIVE';
    if (dto.plan) comp.plan = dto.plan;
    return comp;
  }

  async updateStatus(id: string, dto: UpdateCompanyStatusDto) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.company.update({
          where: { id },
          data: { status: dto.status as any },
        });
      } catch (err: any) {
        this.logger.warn(`PostgreSQL error in updateStatus: ${err.message}`);
      }
    }

    const index = this.mockCompanies.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundException('Company not found.');
    this.mockCompanies[index].status = dto.status;
    return this.mockCompanies[index];
  }

  async verifyLicense(licenseKey: string) {
    if (this.prisma.isConnected) {
      try {
        const company = await this.prisma.company.findUnique({
          where: { licenseKey: licenseKey.trim() },
        });
        if (company) {
          const isValid = company.status === 'ACTIVE' && new Date(company.licenseExpiresAt) > new Date();
          return {
            isValid,
            company: {
              id: company.id,
              name: company.name,
              slug: company.slug,
              status: company.status,
              plan: company.plan,
              expiresAt: company.licenseExpiresAt,
            },
          };
        }
      } catch (err: any) {
        this.logger.warn(`PostgreSQL error in verifyLicense: ${err.message}`);
      }
    }

    const match = this.mockCompanies.find((c) => c.licenseKey === licenseKey.trim());
    if (!match) return { isValid: false, message: 'Invalid license key.' };
    const isValid = match.status === 'ACTIVE' && new Date(match.licenseExpiresAt) > new Date();
    return {
      isValid,
      company: {
        id: match.id,
        name: match.name,
        slug: match.slug,
        status: match.status,
        plan: match.plan,
        expiresAt: match.licenseExpiresAt,
      },
    };
  }

  async getPlatformSaaSSummary() {
    const companies = await this.findAll();
    const totalCompanies = companies.length;
    const activeLicenses = companies.filter((c: any) => c.status === 'ACTIVE').length;
    const trialLicenses = companies.filter((c: any) => c.status === 'TRIAL').length;
    const totalCouriers = companies.reduce((acc: number, c: any) => acc + (c.couriersCount || 0), 0);
    const totalOrders = companies.reduce((acc: number, c: any) => acc + (c.ordersCount || 0), 0);

    return {
      totalCompanies,
      activeLicenses,
      trialLicenses,
      totalCouriers,
      totalOrders,
      estimatedMrr: activeLicenses * 1500 + trialLicenses * 0, // 1500 EGP / company / mo
      currency: 'EGP',
    };
  }
}
