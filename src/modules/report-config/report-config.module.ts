
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Business } from '../business/entities/business.entity.js';
import { Report } from '../report/entity/report.entity.js';


import { ReportConfigController } from './report-config.controller.js';
import { ReportConfigService } from './report-config.service.js';
import { ReportConfig } from './report-config.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportConfig,
      Business,
      Report,
    ]),
  ],
  controllers: [ReportConfigController],
  providers: [ReportConfigService],
  exports: [ReportConfigService],
})
export class ReportConfigModule {}
