
import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  ParseEnumPipe,
  DefaultValuePipe,
} from '@nestjs/common';

import { ReportService } from './report.service.js';
import { ReportPeriod } from './entity/report.entity.js';

@Controller('report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
  ) { }

  /**
   * GET /reports/overview?year=2026
   *
   * GET /reports/overview?year=2026&period=6%20months
   *
   * GET /reports/overview?year=2026&period=12%20months
   */
  @Get('overview')
  async getOverview(
    @Query('year', ParseIntPipe) year: number,

    @Query(
      'period',
      new ParseEnumPipe(ReportPeriod, {
        optional: true,
      }),
    )
    period?: ReportPeriod,
  ) {
    return this.reportService.getOverview(year, period);
  }

  @Get('accident-statistics')
  async getAccidentStatistics(
    @Query(
      'year',
      new DefaultValuePipe(new Date().getFullYear()),
      ParseIntPipe,
    )
    year: number,

    @Query(
      'period',
      new ParseEnumPipe(ReportPeriod, { optional: true }),
    )
    period?: ReportPeriod,
  ) {
    return this.reportService.getAccidentStatistics(
      year,
      period,
    );
  }
}
