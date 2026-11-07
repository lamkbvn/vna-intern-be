import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { ReportConfigService } from './report-config.service.js';
import { CreateReportConfigDto } from './dto/create-report-config.dto.js';
import { QueryReportConfigDto } from './dto/query-report-config.dto.js';
import {
  UpdateReportConfigDto,
  UpdateReportConfigStatusDto,
} from './dto/update-report-config.dto.js';

@Controller(['report-configs', 'report-periods'])
export class ReportConfigController {
  constructor(
    private readonly reportConfigService: ReportConfigService,
  ) { }

  @Get()
  async findAll(@Query() dto: QueryReportConfigDto) {
    return this.reportConfigService.findAll(dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportConfigService.findOne(id);
  }

  @Post()
  async create(
    @Body() dto: CreateReportConfigDto,
  ) {
    return this.reportConfigService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportConfigDto,
  ) {
    return this.reportConfigService.update(id, dto);
  }

  @Put(':id')
  async updatePut(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportConfigDto,
  ) {
    return this.reportConfigService.update(id, dto);
  }

  @Patch('configs/:id/status')
  async updateReportConfigStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportConfigStatusDto,
  ) {
    return this.reportConfigService.updateReportConfigStatus(id, dto.status);
  }
}
