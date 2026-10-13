import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import ms from 'ms';

import { UsersService } from '../users/users.service.js';
import { MailService } from '../mail/mail.service.js';
import Response, { ResponseData } from '../../commons/response.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
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

  // 3. Hàm Quên mật khẩu - gửi mã OTP
  async forgotPassword(email: string) {
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      throw new BadRequestException('email phải đúng định dạng');
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Kiểm tra email có tồn tại trong hệ thống không
    const user = await this.usersService.findByEmail(trimmedEmail);
    if (!user) {
      throw new BadRequestException('email này không tồn tại');
    }

    // Sinh mã OTP ngẫu nhiên 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Mã OTP có thời hạn 5 phút
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Hash mã OTP trước khi lưu vào database để đảm bảo an toàn
    const otpHash = await bcrypt.hash(otp, 10);

    // Lưu OTP hash và thời gian hết hạn vào DB
    await this.usersService.updateResetPasswordOtp(
      user.id,
      otpHash,
      otpExpiresAt,
    );

    // Gửi mã OTP qua email (nếu chưa cấu hình SMTP sẽ in ra console)
    await this.mailService.sendResetPasswordOtp(user.email, otp, {
      fullName: user.fullName,
      username: user.username,
    });

    return {
      message:
        'Mã OTP đã được gửi về email của bạn, vui lòng kiểm tra email để tiếp tục bước tiếp theo.',
      email: user.email,
      expiresIn: '5 phút',
    };
  }

  // 4. Hàm Đặt lại mật khẩu với mã OTP
  async resetPassword(dto: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!dto.email || !emailRegex.test(dto.email.trim())) {
      throw new BadRequestException('email phải đúng định dạng');
    }

    const trimmedEmail = dto.email.trim().toLowerCase();

    // Tìm user theo email kèm mã OTP
    const user =
      await this.usersService.findByEmailWithResetOtp(trimmedEmail);
    if (!user) {
      throw new BadRequestException('email này không tồn tại');
    }

    // Kiểm tra yêu cầu OTP đã tồn tại chưa
    if (!user.resetPasswordOtpHash || !user.resetPasswordOtpExpiresAt) {
      throw new BadRequestException(
        'Không tìm thấy yêu cầu đặt lại mật khẩu. Vui lòng yêu cầu gửi lại mã OTP.',
      );
    }

    // Kiểm tra mã OTP đã hết hạn chưa (5 phút)
    if (new Date() > new Date(user.resetPasswordOtpExpiresAt)) {
      throw new BadRequestException(
        'Mã OTP đã hết hạn (quá 5 phút). Vui lòng yêu cầu mã mới.',
      );
    }

    // So khớp mã OTP
    const isOtpValid = await bcrypt.compare(
      dto.otp,
      user.resetPasswordOtpHash,
    );
    if (!isOtpValid) {
      throw new BadRequestException('Mã OTP không chính xác');
    }

    // Hash mật khẩu mới
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // Cập nhật mật khẩu mới và xóa mã OTP, vô hiệu hóa refresh token cũ
    await this.usersService.updatePassword(user.id, newPasswordHash);

    return {
      message:
        'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
    };
  }

  
async getProfile(userId: string) {
  const user = await this.usersService.findProfileById(userId);

  if (!user) {
    throw Response.errorNotFound(Response.NOT_FOUND('User'));
  }

  return Response.get({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

}