import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessIndustriesService } from './business-industries.service.js';
import { BusinessIndustriesController } from './business-industries.controller.js';
import { BusinessIndustry } from './entities/business-industry.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessIndustry])],
  controllers: [BusinessIndustriesController],
  providers: [BusinessIndustriesService],
  exports: [BusinessIndustriesService, TypeOrmModule],
})
export class BusinessIndustriesModule {}
