import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }

  @Post('refresh')
  async refreshTokens(@Body('refreshToken') refreshToken: string, @Body('userId') userId: string) {
    return this.authService.refreshTokens(userId, refreshToken);
  }


  @Post('logout')
  async logout(@Req() req: any) {
    const userId = req.user['sub']; // Lấy ID user từ token đã xác thực
    return this.authService.logout(userId);
  }
}