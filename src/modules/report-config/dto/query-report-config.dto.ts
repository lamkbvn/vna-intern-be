import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationDto } from '../../../commons/baseDto/pagination.dto.js';
import { ReportPeriod } from '../../report/entity/report.entity.js';

export class QueryReportConfigDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
