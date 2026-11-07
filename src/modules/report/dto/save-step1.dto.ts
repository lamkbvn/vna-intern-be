import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportPeriod } from '../entity/report.entity.js';

export class SaveStep1Dto {
  @IsOptional()
  @IsUUID('4', { message: 'ID báo cáo không hợp lệ' })
  reportId?: string;

  @Type(() => Number)
  @IsInt({ message: 'Năm báo cáo phải là số nguyên' })
  @Min(1900, { message: 'Năm báo cáo không hợp lệ' })
  @Max(2100, { message: 'Năm báo cáo không hợp lệ' })
  year: number;

  @IsEnum(ReportPeriod, { message: 'Kỳ báo cáo phải là "6 months" hoặc "12 months"' })
  @IsNotEmpty({ message: 'Kỳ báo cáo không được để trống' })
  period: ReportPeriod;

  @Type(() => Number)
  @IsInt({ message: 'Tổng số lao động phải là số nguyên' })
  @Min(0, { message: 'Tổng số lao động phải lớn hơn hoặc bằng 0' })
  totalEmployees: number;

  @Type(() => Number)
  @IsInt({ message: 'Tổng số lao động nữ phải là số nguyên' })
  @Min(0, { message: 'Tổng số lao động nữ phải lớn hơn hoặc bằng 0' })
  totalFemaleEmployees: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Tổng quỹ lương phải là số' })
  @Min(0, { message: 'Tổng quỹ lương phải lớn hơn hoặc bằng 0' })
  totalQuyLuong: number;

  @IsOptional()
  @IsUUID('4', { message: 'ID doanh nghiệp không hợp lệ' })
  businessId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID cấu hình báo cáo không hợp lệ' })
  configId?: string;
}
