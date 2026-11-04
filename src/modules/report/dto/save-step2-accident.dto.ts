import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SaveStep2AccidentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số vụ tai nạn phải là số nguyên' })
  @Min(0, { message: 'Tổng số vụ tai nạn không được âm' })
  totalAccident: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số vụ có người chết phải là số nguyên' })
  @Min(0, { message: 'Tổng số vụ có người chết không được âm' })
  totalAccidentDeath: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số vụ có 2 người bị nạn trở lên phải là số nguyên' })
  @Min(0, { message: 'Tổng số vụ có 2 người bị nạn trở lên không được âm' })
  totalHumanInjuredMore2: number = 0;

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
