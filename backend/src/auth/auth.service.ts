import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
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
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

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
    const user = await this.prisma.user.findUnique({
      where: { phone: cleanPhone },
      include: {
        userRoles: {
          include: { role: true },
        },
        courierProfile: true,
      },
    });

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
      });
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

      const cachedToken = await this.redis.get(`refresh_token:${payload.sub}`);
      if (cachedToken && cachedToken !== dto.refreshToken) {
        throw new UnauthorizedException('Refresh token was revoked or replaced.');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userRoles: { include: { role: true } },
          courierProfile: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User account no longer active.');
      }

      const roles = user.userRoles.map((ur) => ur.role.name);
      return await this.generateTokens(user.id, user.phone, user.email, roles);
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

    // Store in Redis / memory fallback for revocation
    await this.redis.set(`refresh_token:${userId}`, refreshToken, 7 * 24 * 3600);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 mins in seconds
    };
  }
}
