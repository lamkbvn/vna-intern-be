import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ReportPeriod } from '../../report/entity/report.entity.js';

export class UpdateReportConfigStatusDto {
  @IsBoolean()
  status: boolean;
}

export class UpdateReportConfigDto {
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsDateString()
  dateStart?: string;

  @IsOptional()
  @IsDateString()
  dateEnd?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
