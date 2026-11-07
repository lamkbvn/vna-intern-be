import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseEnumPipe,
  ParseUUIDPipe,
  DefaultValuePipe,
} from '@nestjs/common';

import { ReportService } from './report.service.js';
import { ReportPeriod } from './entity/report.entity.js';
import { JwtAuthGuard } from '../../commons/guard/jwt-auth.guard.js';
import { RolesGuard } from '../../commons/guard/roles.guard.js';
import { Roles } from '../../commons/decorators/roles.decorator.js';
import { CurrentUser } from '../../commons/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../../commons/decorators/current-user.decorator.js';
import { UserRole } from '../users/user.entity.js';
import { SaveStep1Dto } from './dto/save-step1.dto.js';
import { SaveStep2AccidentDto } from './dto/save-step2-accident.dto.js';
import { SaveStep2DetailDto } from './dto/save-step2-detail.dto.js';
import { SaveStep3AccidentDto } from './dto/save-step3-accident.dto.js';
import { QueryMyReportsDto } from './dto/query-my-reports.dto.js';
import { GetReportsByYearDto } from './dto/get-reports-by-year.dto.js';
import { UpdateAttachmentDto } from './dto/update-attachment.dto.js';

@Controller(['report', 'reports'])
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Get('by-year')
  async getReportsByYear(
    @Query() dto: GetReportsByYearDto,
  ) {
    return this.reportService.getReportsByYear(dto);
  }

  /**
   * GET /reports/overview?year=2026
   * GET /reports/overview?year=2026&period=6%20months
   * GET /reports/overview?year=2026&period=12%20months
   */
  @Get('overview')
  async getOverview(
    @Query('year', ParseIntPipe) year: number,
    @Query('period', new ParseEnumPipe(ReportPeriod, { optional: true }))
    period?: ReportPeriod,
  ) {
    return this.reportService.getOverview(year, period);
  }

  /**
   * GET /reports/accident-statistics?year=2026
   * GET /reports/accident-statistics?year=2026&period=6%20months
   */
  @Get('accident-statistics')
  async getAccidentStatistics(
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
    @Query('period', new ParseEnumPipe(ReportPeriod, { optional: true }))
    period?: ReportPeriod,
  ) {
    return this.reportService.getAccidentStatistics(year, period);
  }

  // =========================================================================
  // CÁC API CHO DOANH NGHIỆP QUẢN LÝ BÁO CÁO LAO ĐỘNG (THEO QUY TRÌNH CÁC BƯỚC)
  // =========================================================================

  /**
   * 0.1 GET /reports/business-info: Xem thông tin cơ sở của doanh nghiệp để chuẩn bị làm báo cáo
   */
  @Get('business-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOANH_NGHIEP, UserRole.ADMIN, UserRole.MANAGER)
  async getBusinessInfo(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query('businessId') businessId?: string,
  ) {
    return this.reportService.getBusinessInfoForReport(currentUser, businessId);
  }

  /**
   * 0.2 GET /reports/my-reports: Danh sách báo cáo của doanh nghiệp (hỗ trợ lọc và phân trang)
   */
  @Get('my-reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOANH_NGHIEP, UserRole.ADMIN, UserRole.MANAGER)
  async getMyReports(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: QueryMyReportsDto,
  ) {
    return this.reportService.getMyReports(query, currentUser);
  }

  /**
   * BƯỚC 1: POST /reports/step-1
   * Lưu thông tin doanh nghiệp & 3 thông tin nhập (tổng lao động, tổng lao động nữ, tổng quỹ lương)
   */
  @Post('step-1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOANH_NGHIEP, UserRole.ADMIN, UserRole.MANAGER)
  async saveStep1(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: SaveStep1Dto,
  ) {
    return this.reportService.saveStep1(dto, currentUser);
  }

  /**
   * BƯỚC 2.1: POST /reports/:reportId/step-2-accident
   * Lưu thông tin tổng số vụ tai nạn lao động
   */
  @Post(':reportId/step-2-accident')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOANH_NGHIEP, UserRole.ADMIN, UserRole.MANAGER)
  async saveStep2Accident(
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: SaveStep2AccidentDto,
  ) {
    return this.reportService.saveStep2Accident(reportId, dto, currentUser);
  }

  /**
   * BƯỚC 2.2: POST /reports/:reportId/step-2-detail
   * Lưu danh sách chi tiết các vụ tai nạn lao động
   */
  @Post(':reportId/step-2-detail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOANH_NGHIEP, UserRole.ADMIN, UserRole.MANAGER)
  async saveStep2Detail(
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: SaveStep2DetailDto,
  ) {
    return this.reportService.saveStep2Detail(reportId, dto, currentUser);
  }

  /**
   * BƯỚC 3: POST /reports/:reportId/step-3-benefit-accident
   * Lưu thông tin tai nạn lao động được hưởng trợ cấp
   */
  @Post(':reportId/step-3-benefit-accident')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOANH_NGHIEP, UserRole.ADMIN, UserRole.MANAGER)
  async saveStep3BenefitAccident(
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: SaveStep3AccidentDto,
  ) {
    return this.reportService.saveStep3BenefitAccident(reportId, dto, currentUser);
  }

  /**
   * BƯỚC 4: GET /reports/:reportId/overview-detail
   * Trả về toàn bộ thông tin đã nhập từ đầu tới giờ (Tổng quan báo cáo)
   */
  @Get(':reportId/overview-detail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOANH_NGHIEP, UserRole.ADMIN, UserRole.MANAGER)
  async getReportSummary(
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.reportService.getReportSummary(reportId, currentUser);
  }

  /**
   * ĐÍNH KÈM BÁO CÁO: PATCH /reports/:reportId/attachment
   */
  @Patch(':reportId/attachment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOANH_NGHIEP, UserRole.ADMIN, UserRole.MANAGER)
  async updateAttachment(
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Body() dto: UpdateAttachmentDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.reportService.updateAttachment(reportId, dto, currentUser);
  }

  /**
   * GỬI BÁO CÁO: POST /reports/:reportId/submit
   * Hoàn thành và nộp báo cáo (chuyển trạng thái sang RECEIVED)
   */
  @Post(':reportId/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOANH_NGHIEP, UserRole.ADMIN, UserRole.MANAGER)
  async submitReport(
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.reportService.submitReport(reportId, currentUser);
  }

  /**
   * XÓA BÁO CÁO: DELETE /reports/:reportId
   * Cho phép xóa báo cáo khi đang ở trạng thái nháp (reporting)
   */
  @Delete(':reportId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOANH_NGHIEP, UserRole.ADMIN, UserRole.MANAGER)
  async deleteReport(
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.reportService.deleteReport(reportId, currentUser);
  }
}
