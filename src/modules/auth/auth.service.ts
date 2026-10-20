import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import ms, { StringValue } from 'ms';

import { UsersService } from '../users/users.service.js';
import { MailService } from '../mail/mail.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
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
      throw new UnauthorizedException('Tên tài khoản hoặc mật khẩu không chính xác');
    }

    // 2. Kiểm tra trạng thái tài khoản
    if (user.isActive === false) {
      throw new UnauthorizedException('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    // 3. Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Tên tài khoản hoặc mật khẩu không chính xác');
    }

    // 3. Tạo payload dùng chung (có đầy đủ role và businessId)
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      roleCode: user.role, // For FE compatibility
      accountType: user.role, // For FE compatibility ('ADMIN' | 'DOANH_NGHIEP')
      businessId: user.businessId ?? null,
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
        role: user.role,
        roleCode: user.role,
        accountType: user.role,
        businessId: user.businessId ?? null,
      },
    });
  }

 async refreshTokens(incomingRefreshToken: string) {
  // 1. Xác minh chữ ký và thời hạn của refresh token
  let payload: { sub: string; username: string };

 try {
  payload = await this.jwtService.verifyAsync(incomingRefreshToken, {
    secret: this.configService.getOrThrow<string>(
      'JWT_REFRESH_SECRET',
    ),
  });
} catch (error) {
  if (error instanceof TokenExpiredError) {
    throw Response.errorUnauthorized(Response.EXPIRED_TOKEN);
  }

  console.error(
    'Refresh token verification error:',
    error instanceof Error ? error.message : error,
  );

  throw Response.errorUnauthorized(Response.WRONG_TOKEN);
}

  if (!payload.sub || !payload.username) {
    throw Response.errorUnauthorized(Response.WRONG_TOKEN);
  }

  // 2. Tìm user từ ID trong payload đã được xác minh
  const user = await this.usersService.findByIdWithRefreshToken(
    payload.sub,
  );

  if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
    throw Response.errorUnauthorized(Response.EXPIRED_TOKEN);
  }

  if (user.isActive === false) {
    throw Response.errorUnauthorized('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
  }

  // 3. Kiểm tra hạn refresh token trong database
  if (new Date() >= new Date(user.refreshTokenExpiresAt)) {
    throw Response.errorUnauthorized(Response.EXPIRED_TOKEN);
  }

  // 4. So sánh refresh token với hash trong database
  const isRefreshTokenValid = await bcrypt.compare(
    incomingRefreshToken,
    user.refreshTokenHash,
  );

  if (!isRefreshTokenValid) {
    throw Response.errorUnauthorized(Response.WRONG_TOKEN);
  }

  // 5. Tạo payload mới
  const newPayload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    roleCode: user.role,
    accountType: user.role,
    businessId: user.businessId ?? null,
  };

  // 6. Tạo cặp token mới
  const refreshExpiresInStr =
    this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    ) as StringValue;

  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(newPayload, {
      secret: this.configService.getOrThrow<string>(
        'JWT_ACCESS_SECRET',
      ),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_ACCESS_EXPIRES_IN',
      ) as StringValue,
    }),
    this.jwtService.signAsync(newPayload, {
      secret: this.configService.getOrThrow<string>(
        'JWT_REFRESH_SECRET',
      ),
      expiresIn: refreshExpiresInStr,
    }),
  ]);

  // 7. Tính thời hạn và hash của refresh token mới
  const newRefreshTokenExpiresAt = new Date(
    Date.now() + ms(refreshExpiresInStr),
  );

  const newRefreshTokenHash = await bcrypt.hash(refreshToken, 10);

  // 8. Cập nhật refresh token trong database
  await this.usersService.updateRefreshTokenData(
    user.id,
    newRefreshTokenHash,
    newRefreshTokenExpiresAt,
  );

  // 9. Trả token về client
  return Response.get({
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
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

  // 5. Đổi mật khẩu cho người dùng đang đăng nhập
  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }

    if (dto.password === dto.newPassword) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu cũ hiện tại');
    }

    const user = await this.usersService.findByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không chính xác. Vui lòng kiểm tra lại');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    // Cập nhật mật khẩu mới và xóa refresh token cũ để vô hiệu hóa phiên cũ
    await this.usersService.updatePassword(user.id, newPasswordHash);

    return {
      code: HttpStatus.OK,
      success: true,
      message: 'Đổi mật khẩu thành công! Hệ thống sẽ tự động đăng xuất ngay bây giờ!',
    };
  }
}