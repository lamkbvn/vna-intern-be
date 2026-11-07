import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional, IsEnum, IsString } from 'class-validator';
import { PaginationDto } from '../../../commons/baseDto/pagination.dto.js';
import { ReportPeriod, ReportStatus } from '../entity/report.entity.js';

export class GetReportsByYearDto extends PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsString()
  search?: string;
}
