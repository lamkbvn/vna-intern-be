import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NguyenNhanTaiNan } from '../entity/report-detail-accident.entity.js';

export class ReportDetailItemDto {
  @IsEnum(NguyenNhanTaiNan, { message: 'Nguyên nhân tai nạn lao động không hợp lệ' })
  @IsNotEmpty({ message: 'Nguyên nhân tai nạn lao động không được để trống' })
  nguyenNhanTaiNan: NguyenNhanTaiNan;

  @IsString({ message: 'Yếu tố chấn thương phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Yếu tố chấn thương không được để trống' })
  yeuToChanThuong: string;

  @IsString({ message: 'Nghề nghiệp phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Nghề nghiệp không được để trống' })
  ngheNghiep: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số người bị nạn phải là số nguyên' })
  @Min(0, { message: 'Tổng số người bị nạn không được âm' })
  totalHumanInjured: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số lao động nữ bị nạn phải là số nguyên' })
  @Min(0, { message: 'Tổng số lao động nữ bị nạn không được âm' })
  totalFemaleInjured: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số người bị chết phải là số nguyên' })
  @Min(0, { message: 'Tổng số người bị chết không được âm' })
  totalHumanDeath: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số người bị thương nặng phải là số nguyên' })
  @Min(0, { message: 'Tổng số người bị thương nặng không được âm' })
  totalHumanInjuredHeavy: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số người bị nạn không thuộc diện quản lý phải là số nguyên' })
  @Min(0, { message: 'Tổng số người bị nạn không thuộc diện quản lý không được âm' })
  totalHumanInjuredNoQL: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số lao động nữ bị nạn không thuộc diện quản lý phải là số nguyên' })
  @Min(0, { message: 'Tổng số lao động nữ bị nạn không thuộc diện quản lý không được âm' })
  totalFemaleInjuredNoQL: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số người bị chết không thuộc diện quản lý phải là số nguyên' })
  @Min(0, { message: 'Tổng số người bị chết không thuộc diện quản lý không được âm' })
  totalHumanDeathNoQL: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số người bị thương nặng không thuộc diện quản lý phải là số nguyên' })
  @Min(0, { message: 'Tổng số người bị thương nặng không thuộc diện quản lý không được âm' })
  totalHumanInjuredHeavyNoQL: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Chi phí y tế phải là số' })
  @Min(0, { message: 'Chi phí y tế không được âm' })
  budgetMedical: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Chi phí trả lương trong thời gian điều trị phải là số' })
  @Min(0, { message: 'Chi phí trả lương trong thời gian điều trị không được âm' })
  budgetSalary: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Chi phí bồi thường trợ cấp phải là số' })
  @Min(0, { message: 'Chi phí bồi thường trợ cấp không được âm' })
  budgetHelp: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tổng số tiền chi phí phải là số' })
  @Min(0, { message: 'Tổng số tiền chi phí không được âm' })
  totalBudget: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số ngày nghỉ phải là số nguyên' })
  @Min(0, { message: 'Tổng số ngày nghỉ không được âm' })
  totalDayOff: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tổng thiệt hại tài sản phải là số' })
  @Min(0, { message: 'Tổng thiệt hại tài sản không được âm' })
  totalThietHai: number = 0;
}

export class SaveStep2DetailDto {
  @IsArray({ message: 'Danh sách chi tiết vụ tai nạn phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => ReportDetailItemDto)
  details: ReportDetailItemDto[];
}
