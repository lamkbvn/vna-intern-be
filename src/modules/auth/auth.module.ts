
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { MailModule } from '../mail/mail.module.js';

import { JwtStrategy } from '../../commons/guard/jwt.strategy.js';
import { JwtAuthGuard } from '../../commons/guard/jwt-auth.guard.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    UsersModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
