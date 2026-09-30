import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../common/prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  phone: string;
  email?: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'fastman_super_secret_jwt_access_key_2026_change_in_production!',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: { role: true },
        },
        courierProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is deactivated or not found.');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      roles,
      courierId: user.courierProfile?.id,
      courierStatus: user.courierProfile?.status,
    };
  }
}
