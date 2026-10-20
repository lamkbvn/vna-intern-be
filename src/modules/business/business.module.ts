import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessService } from './business.service.js';
import { BusinessController } from './business.controller.js';
import { Business } from './entities/business.entity.js';
import { BusinessType } from '../business-types/entities/business-type.entity.js';
import { BusinessIndustry } from '../business-industries/entities/business-industry.entity.js';
import { User } from '../users/user.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessType, BusinessIndustry, User]),
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService, TypeOrmModule],
})
export class BusinessModule {}
