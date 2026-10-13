import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import ms from 'ms';

import { UsersService } from '../users/users.service.js';
import Response, { ResponseData } from '../../commons/response.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(username: string, password: string) {
    // 1. Tìm user theo username
    const user =
      await this.usersService.findByUsernameWithPassword(username);

    if (!user) {
      throw Response.errorNotFound(Response.NOT_FOUND('User'));
    }

    // 2. Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw Response.errorBad(Response.WRONG_PASS);
    }

    // 3. Tạo payload dùng chung
    const payload = {
      sub: user.id,
      username: user.username,
    };

    // 4. Tạo access token và refresh token
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>(
          'JWT_ACCESS_SECRET',
        ),
        expiresIn: this.configService.getOrThrow<any>(
          'JWT_ACCESS_EXPIRES_IN',
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_SECRET',
        ),
        expiresIn: this.configService.getOrThrow<any>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
      }),
    ]);

    // 5. Tính thời gian hết hạn của Refresh Token dựa trên file .env
    const refreshExpiresInStr = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    const refreshTokenExpiresAt = new Date(Date.now() + ms(refreshExpiresInStr as any));

    // 6. Hash refresh token trước khi lưu database
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // Cập nhật cả hash và thời gian hết hạn vào DB
    await this.usersService.updateRefreshTokenData(
      user.id,
      refreshTokenHash,
      refreshTokenExpiresAt,
    );

    // 7. Trả kết quả cho client
    return Response.get({
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      },
    });
  }

  // 1. Hàm làm mới Access Token khi hết hạn
  async refreshTokens(userId: string, incomingRefreshToken: string) {
    // Tìm user kèm theo trường refreshTokenHash và refreshTokenExpiresAt
    const user = await this.usersService.findByIdWithRefreshToken(userId);

    if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      throw Response.errorUnauthorized(Response.EXPIRED_TOKEN);
    }

    // Kiểm tra xem Refresh Token trong DB đã hết hạn chưa
    if (new Date() > new Date(user.refreshTokenExpiresAt)) {
      throw Response.errorUnauthorized(Response.EXPIRED_TOKEN);
    }

    // So sánh refresh token gửi lên với hash trong database
    const isRefreshTokenValid = await bcrypt.compare(
      incomingRefreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw Response.errorUnauthorized(Response.WRONG_TOKEN);
    }

    // Tạo payload mới
    const payload = {
      sub: user.id,
      username: user.username,
    };

    // Tạo cặp token mới
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow<any>('JWT_ACCESS_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<any>('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    // Tính hạn mới cho refresh token
    const refreshExpiresInStr = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    const newRefreshTokenExpiresAt = new Date(Date.now() + ms(refreshExpiresInStr as any));
    const newRefreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // Cập nhật lại hash mới và thời gian hết hạn mới vào DB
    await this.usersService.updateRefreshTokenData(
      user.id,
      newRefreshTokenHash,
      newRefreshTokenExpiresAt,
    );

    return Response.get({
      accessToken,
      refreshToken,
      tokenType: 'Bearer'
    });
  }

  // 2. Hàm Logout (Xóa sạch token data trong DB)
  async logout(userId: string) {
    await this.usersService.updateRefreshTokenData(userId, null, null);
    return Response.get({ message: 'Đăng xuất thành công' });
  }
}