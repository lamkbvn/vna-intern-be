import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

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

}