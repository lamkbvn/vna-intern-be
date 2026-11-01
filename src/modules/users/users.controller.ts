
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { UsersService } from './users.service.js';
import { AuthService } from '../auth/auth.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { JwtAuthGuard } from '../../commons/guard/jwt-auth.guard.js';
import { RolesGuard } from '../../commons/guard/roles.guard.js';
import { Roles } from '../../commons/decorators/roles.decorator.js';
import { UserRole } from './user.entity.js';
import { VerifyEmailChangeDto } from './dto/verify-email-change.dto.js';
import { ChangeEmailDto } from './dto/change-email.dto.js';
import { PaginationDto } from '../../commons/baseDto/pagination.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import Response from '../../commons/response.js';
import * as bcrypt from 'bcrypt';

interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        username: string;
    };
}

@Controller(['users', 'user'])
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @Get()
    async findAllByPage(@Query() paginationDto: PaginationDto) {
        return this.usersService.findAllByPage(
            paginationDto.pageNumber,
            paginationDto.pageSize,
        );
    }

    // GET /users/deleted
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('deleted')
    async getDeletedUsers(@Query() paginationDto: PaginationDto) {
        return this.usersService.getDeletedUsers(
            paginationDto.pageNumber ?? 1,
            paginationDto.pageSize ?? 100,
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

    // POST /users/avatar
    // Upload ảnh đại diện lưu vào thư mục cục bộ uploads/avatars
    @UseGuards(JwtAuthGuard)
    @Post('avatar')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (_req, _file, cb) => {
                    const uploadPath = join(process.cwd(), 'uploads', 'avatars');
                    if (!existsSync(uploadPath)) {
                        mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                },
                filename: (req: any, file, cb) => {
                    const userId = req.user?.userId || 'user';
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname).toLowerCase();
                    cb(null, `${userId}-${uniqueSuffix}${ext}`);
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 }, // Tối đa 5MB
            fileFilter: (_req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/i)) {
                    return cb(
                        new BadRequestException('Chỉ chấp nhận các định dạng ảnh: jpg, jpeg, png, webp, gif'),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    async uploadAvatar(
        @Req() req: AuthenticatedRequest,
        @UploadedFile() file?: Express.Multer.File,
        @Body('userId') targetUserId?: string,
    ) {
        if (!file) {
            throw new BadRequestException('Không tìm thấy file ảnh được tải lên');
        }
        const avatarUrl = `/uploads/avatars/${file.filename}`;
        if (targetUserId) {
            return this.usersService.updateAvatar(targetUserId, avatarUrl);
        }
        return Response.get({
            message: 'Tải ảnh lên thành công',
            avatar: avatarUrl,
        });
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('create')
    async createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto);
    }

    // PATCH /users/profile
    // Cập nhật thông tin cá nhân
    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    async updateProfile(
        @Req() req: AuthenticatedRequest,
        @Body() dto: UpdateProfileDto,
    ) {
        // Chỉ cho phép đổi vai trò nếu tài khoản đăng nhập là ADMIN
        let safeDto = dto;
        if ((req.user as any)?.role !== UserRole.ADMIN) {
            const { role: _role, ...rest } = dto;
            safeDto = rest;
        }
        return this.usersService.updateProfile(
            req.user.userId,
            safeDto,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id/reset-password')
    async resetUserPassword(
        @Param('id') id: string,
        @Body() body: { newPassword?: string; password?: string },
    ) {
        const pwd = body.newPassword || body.password;
        if (!pwd || !pwd.trim()) {
            throw new BadRequestException('Vui lòng nhập mật khẩu mới');
        }
        const passwordHash = await bcrypt.hash(pwd.trim(), 12);
        await this.usersService.updatePassword(id, passwordHash);
        return Response.get({
            message: 'Khởi tạo mật khẩu thành công',
        });
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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch('delete')
    async deleteUsersBatch(
        @Body() body: { ids?: string[]; accountIds?: string[]; userIds?: string[] }
    ) {
        const ids = body.ids || body.accountIds || body.userIds || [];
        return await this.usersService.deleteUsers(ids);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete('batch')
    async deleteUsersBatchDelete(
        @Body() body: { ids?: string[]; accountIds?: string[]; userIds?: string[] }
    ) {
        const ids = body.ids || body.accountIds || body.userIds || [];
        return await this.usersService.deleteUsers(ids);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch('restore-batch')
    async restoreUsersBatch(
        @Body() body: { ids?: string[]; accountIds?: string[]; userIds?: string[] }
    ) {
        const ids = body.ids || body.accountIds || body.userIds || [];
        return await this.usersService.restoreUsers(ids);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id/restore')
    async restoreUser(@Param('id') id: string) {
        return await this.usersService.restoreUser(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete('permanent-batch')
    async permanentDeleteUsersBatch(
        @Body() body: { ids?: string[]; accountIds?: string[]; userIds?: string[] }
    ) {
        const ids = body.ids || body.accountIds || body.userIds || [];
        return await this.usersService.permanentDeleteUsers(ids);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id/permanent')
    async permanentDeleteUser(@Param('id') id: string) {
        return await this.usersService.permanentDeleteUser(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        return await this.usersService.deleteUser(id);
    }

}
