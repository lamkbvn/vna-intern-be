import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { ReportService } from './report.service.js';
import { JwtAuthGuard } from '../../commons/guard/jwt-auth.guard.js';
import { RolesGuard } from '../../commons/guard/roles.guard.js';
import { Roles } from '../../commons/decorators/roles.decorator.js';
import { UserRole } from '../users/user.entity.js';

export class ApproveReportsDto {
  @IsArray()
  @IsString({ each: true })
  reportIds: string[];
}

export class RejectReportsDto {
  @IsArray()
  @IsString({ each: true })
  reportIds: string[];

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

@Controller('so/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
export class SoReportController {
  constructor(private readonly reportService: ReportService) {}

  @Patch('approve')
  async approve(@Body() body: ApproveReportsDto) {
    return this.reportService.approveReports(body.reportIds);
  }

  @Patch('reject')
  async reject(@Body() body: RejectReportsDto) {
    const note = body.note || body.reason;
    return this.reportService.rejectReports(body.reportIds, note);
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    return this.reportService.getReportTimeline(id);
  }
}
