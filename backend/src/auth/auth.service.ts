import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { AuditService } from '../audit/audit.service';
import { AdminLoginDto, CourierLoginDto, RefreshTokenDto } from './dto/login.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
    private readonly audit: AuditService,
  ) {}

  async loginAdmin(dto: AdminLoginDto, ip?: string, userAgent?: string) {
    let user: any = null;
    if (this.prisma.isConnected) {
      try {
        user = await this.prisma.user.findUnique({
          where: { email: dto.email.toLowerCase().trim() },
          include: {
            userRoles: {
              include: { role: true },
            },
          },
        });
      } catch (dbErr: any) {
        this.logger.warn(`PostgreSQL error, falling back to demo credentials: ${dbErr.message}`);
      }
    }

    if (!user) {
      const demoStaff = [
        { email: 'admin@fastman.com', name: 'Tarek Admin', id: 'usr-admin', role: RoleType.ADMIN },
        { email: 'dispatcher@fastman.com', name: 'Hassan Dispatcher', id: 'usr-dispatcher', role: RoleType.DISPATCHER },
        { email: 'superadmin@fastman.com', name: 'Raafat SuperAdmin', id: 'usr-superadmin', role: RoleType.SUPER_ADMIN },
      ];
      const match = demoStaff.find((s) => s.email === dto.email.toLowerCase().trim());
      if (match && dto.password === 'Password123!') {
        const tokens = await this.generateTokens(match.id, '+201000000002', match.email, [match.role]);
        return {
          user: {
            id: match.id,
            name: match.name,
            email: match.email,
            phone: '+201000000002',
            roles: [match.role],
          },
          ...tokens,
        };
      }
      if (!this.prisma.isConnected) {
        throw new UnauthorizedException('Database offline. Use demo credentials (admin@fastman.com / Password123!) or start PostgreSQL.');
      }
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const hasAdminAccess = roles.some((r) =>
      ([RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DISPATCHER] as RoleType[]).includes(r),
    );

    if (!hasAdminAccess) {
      throw new UnauthorizedException('User does not have administrative dashboard access.');
    }

    const tokens = await this.generateTokens(user.id, user.phone, user.email, roles);

    await this.audit.log({
      userId: user.id,
      action: 'ADMIN_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      ipAddress: ip,
      userAgent: userAgent,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles,
      },
      ...tokens,
    };
  }

  async loginCourier(dto: CourierLoginDto, ip?: string, userAgent?: string) {
    const cleanPhone = dto.phone.trim();
    let user: any = null;

    if (this.prisma.isConnected) {
      try {
        user = await this.prisma.user.findUnique({
          where: { phone: cleanPhone },
          include: {
            userRoles: {
              include: { role: true },
            },
            courierProfile: true,
          },
        });
      } catch (dbErr: any) {
        this.logger.warn(`PostgreSQL error, falling back to demo credentials: ${dbErr.message}`);
      }
    }

    if (!user) {
      const demoCouriers = [
        { phone: '+201000000011', name: 'Ahmed Mohamed', id: 'usr-courier-1', courierId: 'cour-1', status: 'AVAILABLE', plate: 'ق ل م 123' },
        { phone: '+201000000012', name: 'Mohamed Taha', id: 'usr-courier-2', courierId: 'cour-2', status: 'BUSY', plate: 'س ع د 456' },
        { phone: '+201000000013', name: 'Mostafa Ali', id: 'usr-courier-3', courierId: 'cour-3', status: 'OFFLINE', plate: 'ن ص ر 789' },
      ];
      const match = demoCouriers.find((c) => c.phone === cleanPhone);
      if (match && dto.password === 'Courier123!') {
        const tokens = await this.generateTokens(match.id, match.phone, null, [RoleType.COURIER]);
        return {
          user: {
            id: match.id,
            name: match.name,
            phone: match.phone,
            roles: [RoleType.COURIER],
            courierId: match.courierId,
            courierStatus: match.status,
            vehicleType: 'MOTORCYCLE',
            plateNumber: match.plate,
          },
          ...tokens,
        };
      }
      if (!this.prisma.isConnected) {
        throw new UnauthorizedException('Database offline. Use demo credentials (+201000000011 / Courier123!) or start PostgreSQL.');
      }
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid phone number or password.');
    }

    const isMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid phone number or password.');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    if (!roles.includes(RoleType.COURIER)) {
      throw new UnauthorizedException('Account is not registered as a courier.');
    }

    if (dto.deviceToken) {
      await this.prisma.deviceToken.upsert({
        where: {
          userId_token: {
            userId: user.id,
            token: dto.deviceToken,
          },
        },
        update: { updatedAt: new Date() },
        create: {
          userId: user.id,
          token: dto.deviceToken,
          platform: 'mobile',
        },
      }).catch(() => {});
    }

    const tokens = await this.generateTokens(user.id, user.phone, user.email, roles);

    await this.audit.log({
      userId: user.id,
      action: 'COURIER_LOGIN',
      entityType: 'COURIER',
      entityId: user.courierProfile?.id,
      ipAddress: ip,
      userAgent: userAgent,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        roles,
        courierId: user.courierProfile?.id,
        courierStatus: user.courierProfile?.status,
        vehicleType: user.courierProfile?.vehicleType,
        plateNumber: user.courierProfile?.plateNumber,
      },
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'fastman_super_secret_jwt_refresh_key_2026_change_in_production!',
      });

      return await this.generateTokens(payload.sub, payload.phone, payload.email, payload.roles);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  async logout(userId: string) {
    await this.redis.del(`refresh_token:${userId}`);
    return { message: 'Logged out successfully.' };
  }

  private async generateTokens(userId: string, phone: string, email: string | null, roles: string[]) {
    const payload = { sub: userId, phone, email, roles };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'fastman_super_secret_jwt_access_key_2026_change_in_production!',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'fastman_super_secret_jwt_refresh_key_2026_change_in_production!',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    await this.redis.set(`refresh_token:${userId}`, refreshToken, 7 * 24 * 3600);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}
