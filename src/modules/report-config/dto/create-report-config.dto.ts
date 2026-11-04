
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MaxLength,
} from 'class-validator';

import { ReportPeriod } from '../../report/entity/report.entity.js';

export class CreateReportConfigDto {
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsEnum(ReportPeriod)
  period: ReportPeriod;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsDateString()
  dateStart: string;

  @IsDateString()
  dateEnd: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
