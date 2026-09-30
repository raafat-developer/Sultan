import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { RoleType } from '@prisma/client';
import * as argon2 from 'argon2';

export interface CreateUserDto {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: RoleType;
  vehicleType?: string;
  plateNumber?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto, role?: RoleType) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) {
      where.userRoles = { some: { role: { name: role } } };
    }
    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          userRoles: { include: { role: true } },
          courierProfile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const sanitized = users.map((u) => {
      const { passwordHash, ...rest } = u;
      return {
        ...rest,
        roles: u.userRoles.map((ur) => ur.role.name),
      };
    });

    return {
      data: sanitized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: dto.phone.trim() },
          ...(dto.email ? [{ email: dto.email.trim().toLowerCase() }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException('User with this phone or email already exists.');
    }

    const role = await this.prisma.role.findUniqueOrThrow({
      where: { name: dto.role },
    });

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        phone: dto.phone.trim(),
        email: dto.email?.trim().toLowerCase(),
        passwordHash,
        userRoles: {
          create: { roleId: role.id },
        },
        courierProfile: dto.role === RoleType.COURIER
          ? {
              create: {
                vehicleType: dto.vehicleType || 'MOTORCYCLE',
                plateNumber: dto.plateNumber,
              },
            }
          : undefined,
      },
      include: {
        userRoles: { include: { role: true } },
        courierProfile: true,
      },
    });

    const { passwordHash: _, ...rest } = user;
    return {
      ...rest,
      roles: [dto.role],
    };
  }

  async toggleActive(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, name: true, phone: true, email: true, isActive: true },
    });
  }
}
