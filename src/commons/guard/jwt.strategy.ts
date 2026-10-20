
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../modules/users/users.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(
        'JWT_ACCESS_SECRET',
      ),
    });
  }

  async validate(payload: {
    sub: string;
    username: string;
    role?: string;
    businessId?: string | null;
  }) {
    const user = await this.usersService.findProfileById(payload.sub);
    if (!user || user.isActive === false) {
      throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không tồn tại');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      businessId: payload.businessId ?? null,
    };
  }
}
