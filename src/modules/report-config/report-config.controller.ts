
import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';


import { ReportConfigService } from './report-config.service.js';
import { CreateReportConfigDto } from './dto/create-report-config.dto.js';
import { UpdateReportConfigStatusDto } from './dto/update-report-config.dto.js';


@Controller('report-configs')
export class ReportConfigController {
  constructor(
    private readonly reportConfigService: ReportConfigService,
  ) { }

  @Post()
  async create(
    @Body() dto: CreateReportConfigDto,
  ) {
    return this.reportConfigService.create(dto);
  }

  @Patch('configs/:id/status')
  async updateReportConfigStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportConfigStatusDto,
  ) {
    return this.reportConfigService.updateReportConfigStatus(id, dto.status);
  }
}
