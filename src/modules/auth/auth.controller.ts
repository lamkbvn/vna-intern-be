import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { Controller, Post, Body, Req, UseGuards, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from '../../commons/guard/jwt-auth.guard.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }

  @Post('refresh')
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId; // Lấy ID user từ token đã xác thực
    return this.authService.logout(userId);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.userId, dto);
  }
}