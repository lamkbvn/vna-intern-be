
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { UsersService } from './users.service.js';
import { AuthService } from '../auth/auth.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { JwtAuthGuard } from '../../commons/guard/jwt-auth.guard.js';
import { VerifyEmailChangeDto } from './dto/verify-email-change.dto.js';
import { ChangeEmailDto } from './dto/change-email.dto.js';
import { PaginationDto } from '../../commons/baseDto/pagination.dto.js';

interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        username: string;
    };
}

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllByPage(@Query() paginationDto: PaginationDto) {
        return this.usersService.findAllByPage(
            paginationDto.pageNumber,
            paginationDto.pageSize,
        );
    }

    // GET /users/profile
    // Lấy thông tin người dùng đang đăng nhập 
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Req() req: AuthenticatedRequest) {
        console.log('User từ access token:', req.user.userId);
        return this.usersService.getProfile(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profilebyid/:id')
    async getProfilebyid(@Param('id') id: string) {
        console.log('User từ access token:', id);
        return this.usersService.getProfile(id);
    }

    // PATCH /users/profile
    // Cập nhật thông tin cá nhân
    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    async updateProfile(
        @Req() req: AuthenticatedRequest,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(
            req.user.userId,
            dto,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile/:id')
    async updateProfileById(
        @Param('id') id: string,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(
            id,
            dto,
        );
    }


    @UseGuards(JwtAuthGuard)
    @Post('email/change/request')
    async requestEmailChange(
        @Req() req: AuthenticatedRequest,
        @Query('id') id: string,
    ) {
        const userId = id || req.user.userId; // Nếu id được cung cấp, sử dụng nó; nếu không, sử dụng userId từ token
        return this.usersService.requestEmailChange(
            userId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('email/change/verify-otp')
    async verifyEmailChangeOtp(
        @Req() req: AuthenticatedRequest,
        @Query('id') id: string,
        @Body() dto: VerifyEmailChangeDto,
    ) {
        const userId = id || req.user.userId; // Nếu id được cung cấp, sử dụng nó; nếu không, sử dụng userId từ token
        return this.usersService.verifyEmailChangeOtp(
            userId,
            dto.otp,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch('email/change')
    async changeEmail(
        @Req() req: AuthenticatedRequest,
        @Query('id') id: string,
        @Body() dto: ChangeEmailDto,
    ) {
        const userId = id || req.user.userId; // Nếu id được cung cấp, sử dụng nó; nếu không, sử dụng userId từ token
        return this.usersService.changeEmail(
            userId,
            dto.newEmail,
        );
    }

    // Xóa OTP đặt lại mật khẩu
    @UseGuards(JwtAuthGuard)
    @Delete('otp/reset-password')
    async clearResetPasswordOtp(
        @Body() body: { email: string; },
    ) {
        await this.usersService.clearResetPasswordOtp(
            body.email,
        );

        return {
            message: 'Đã xóa OTP đặt lại mật khẩu',
        };
    }

    // Xóa OTP thay đổi email
    @UseGuards(JwtAuthGuard)
    @Delete('otp/change-email')
    async clearChangeEmailOtp(
        @Req() req: AuthenticatedRequest,
        @Query('id') id: string,
    ) {
        const userId = id || req.user.userId; // Nếu id được cung cấp, sử dụng nó; nếu không, sử dụng userId từ token
        await this.usersService.clearChangeEmailOtp(
            userId,
        );

        return {
            message: 'Đã xóa OTP thay đổi email',
        };
    }

}
