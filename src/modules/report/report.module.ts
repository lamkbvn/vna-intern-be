
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Business } from '../business/entities/business.entity.js';
import { BusinessType } from '../business-types/entities/business-type.entity.js';
import { BusinessIndustry } from '../business-industries/entities/business-industry.entity.js';

import { Report } from './entity/report.entity.js';
import { ReportAccident } from './entity/report-accident.entity.js';
import { ReportDetailAccident } from './entity/report-detail-accident.entity.js';
import { ReportConfig } from '../report-config/report-config.entity.js';

import { ReportController } from './report.controller.js';
import { ReportService } from './report.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      BusinessType,
      BusinessIndustry,
      Report,
      ReportAccident,
      ReportDetailAccident,
      ReportConfig,
    ]),
  ],

  controllers: [ReportController],

  providers: [ReportService],

  exports: [ReportService],
})
export class ReportModule {}
