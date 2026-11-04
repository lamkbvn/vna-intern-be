import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../commons/baseDto/pagination.dto.js';
import { ReportPeriod, ReportStatus } from '../entity/report.entity.js';

export class QueryMyReportsDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}
