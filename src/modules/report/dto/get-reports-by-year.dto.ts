import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';
import { PaginationDto } from '../../../commons/baseDto/pagination.dto.js';


export class GetReportsByYearDto extends PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;
}