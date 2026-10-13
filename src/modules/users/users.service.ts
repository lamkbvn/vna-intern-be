import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import Response, { ResponseData } from '../../commons/response.js';
import { MailService } from '../mail/mail.service.js';
import { BadRequestException } from '../../commons/error.js';
import { randomInt } from 'crypto';
import bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly mailService: MailService,
    ) { }


    async findProfileById(id: string) {
        return this.userRepository.findOne({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                gender: true,
                dateOfBirth: true,
                province: true,
                district: true,
                streetAddress: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }


    findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email },
        });
    }

    async findByEmailWithPassword(email: string) {
        return this.userRepository.findOne({
            where: { email },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                fullName: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async create(data: {
        email: string;
        passwordHash: string;
    }) {
        const user = this.userRepository.create(data);
        return this.userRepository.save(user);
    }


    async findByUsernameWithPassword(username: string) {
        return this.userRepository.findOne({
            where: { username },
            select: {
                id: true,
                username: true,
                email: true,
                passwordHash: true,
                fullName: true,
            },
        });
    }

    async findByIdWithPassword(id: string) {
        return this.userRepository.findOne({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                passwordHash: true,
                fullName: true,
            },
        });
    }

    async updateRefreshTokenData(userId: string, refreshTokenHash: string | null, refreshTokenExpiresAt: Date | null) {
        return this.userRepository.update(userId, {
            refreshTokenHash,
            refreshTokenExpiresAt,
        });
    }

    async findByIdWithRefreshToken(id: string) {
        return this.userRepository.findOne({
            where: { id },
            select: ['id', 'username', 'refreshTokenHash'],
        });
    }

    async findByEmailWithResetOtp(email: string) {
        return this.userRepository.findOne({
            where: { email },
            select: [
                'id',
                'email',
                'username',
                'resetPasswordOtpHash',
                'resetPasswordOtpExpiresAt',
            ],
        });
    }

    async updateResetPasswordOtp(
        userId: string,
        resetPasswordOtpHash: string | null,
        resetPasswordOtpExpiresAt: Date | null,
    ) {
        return this.userRepository.update(userId, {
            resetPasswordOtpHash,
            resetPasswordOtpExpiresAt,
        });
    }

    async updatePassword(userId: string, newPasswordHash: string) {
        return this.userRepository.update(userId, {
            passwordHash: newPasswordHash,
            resetPasswordOtpHash: null,
            resetPasswordOtpExpiresAt: null,
            refreshTokenHash: null,
            refreshTokenExpiresAt: null,
        });
    }

    async updateProfile(
        userId: string,
        dto: UpdateProfileDto,
    ) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw Response.errorNotFound(Response.NOT_FOUND('User'));
        }

        if (dto.fullName !== undefined) {
            user.fullName = dto.fullName;
        }

        if (dto.dateOfBirth !== undefined) {
            user.dateOfBirth = dto.dateOfBirth;
        }

        if (dto.gender !== undefined) {
            user.gender = dto.gender;
        }

        if (dto.province !== undefined) {
            user.province = dto.province;
        }

        if (dto.district !== undefined) {
            user.district = dto.district;
        }

        if (dto.streetAddress !== undefined) {
            user.streetAddress = dto.streetAddress;
        }

        const updatedUser = await this.userRepository.save(user);

        return Response.get({
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            dateOfBirth: updatedUser.dateOfBirth,
            gender: updatedUser.gender,
            province: updatedUser.province,
            district: updatedUser.district,
            streetAddress: updatedUser.streetAddress,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        });
    }

    async getProfile(userId: string) {
        const user = await this.findProfileById(userId);

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
            province: user.province,
            district: user.district,
            streetAddress: user.streetAddress,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }

    async requestEmailChange(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw Response.errorNotFound(Response.NOT_FOUND('User'));
        }

        const otp = randomInt(0, 1_000_000)
            .toString()
            .padStart(6, '0');

        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.userRepository.update(userId, {
            changeEmailOtpHash: otpHash,
            changeEmailOtpExpiresAt: expiresAt,
            changeEmailOtpVerified: false,
        });

        try {
            await this.mailService.sendEmailChangeOtp(user.email, otp);
        } catch {
            await this.userRepository.update(userId, {
                changeEmailOtpHash: null,
                changeEmailOtpExpiresAt: null,
                changeEmailOtpVerified: false,
            });

            throw new InternalServerErrorException(
                'Không thể gửi OTP. Vui lòng thử lại.',
            );
        }

        return Response.get({
            message: 'OTP đã được gửi đến email hiện tại',
            expiresIn: 600,
        });
    }


    async verifyEmailChangeOtp(userId: string, otp: string) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.changeEmailOtpHash')
            .where('user.id = :userId', { userId })
            .getOne();

        if (!user) {
            throw Response.errorNotFound(Response.NOT_FOUND('User'));
        }

        if (
            !user.changeEmailOtpHash ||
            !user.changeEmailOtpExpiresAt
        ) {
            throw new BadRequestException('Bạn chưa yêu cầu OTP');
        }

        if (user.changeEmailOtpExpiresAt.getTime() <= Date.now()) {
            await this.userRepository.update(userId, {
                changeEmailOtpHash: null,
                changeEmailOtpExpiresAt: null,
                changeEmailOtpVerified: false,
            });

            throw new BadRequestException('OTP đã hết hạn');
        }

        const isValid = await bcrypt.compare(
            otp,
            user.changeEmailOtpHash,
        );

        if (!isValid) {
            throw new UnauthorizedException('OTP không chính xác');
        }

        await this.userRepository.update(userId, {
            changeEmailOtpVerified: true,
        });

        return Response.get({
            message: 'Xác minh OTP thành công. Bạn có thể nhập email mới.',
        });
    }

    async changeEmail(userId: string, newEmail: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw Response.errorNotFound(Response.NOT_FOUND('User'));
        }

        if (
            !user.changeEmailOtpVerified ||
            !user.changeEmailOtpExpiresAt ||
            user.changeEmailOtpExpiresAt.getTime() <= Date.now()
        ) {
            throw new BadRequestException(
                'Bạn cần xác minh OTP trước khi đổi email',
            );
        }

        const normalizedEmail = newEmail.trim().toLowerCase();

        if (normalizedEmail === user.email.toLowerCase()) {
            throw new BadRequestException(
                'Email mới phải khác email hiện tại',
            );
        }

        const existingUser = await this.userRepository.findOne({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            throw new ConflictException('Email mới đã được sử dụng');
        }

        // Cập nhật có điều kiện để không thể dùng lại trạng thái xác minh.
        const result = await this.userRepository.update(
            {
                id: userId,
                changeEmailOtpVerified: true,
            },
            {
                email: normalizedEmail,
                changeEmailOtpHash: null,
                changeEmailOtpExpiresAt: null,
                changeEmailOtpVerified: false,
            },
        );

        if (!result.affected) {
            throw new BadRequestException(
                'Yêu cầu đổi email không còn hợp lệ. Vui lòng xác minh lại OTP.',
            );
        }

        return Response.get({
            message: 'Đổi email thành công',
            email: normalizedEmail,
        });
    }

}