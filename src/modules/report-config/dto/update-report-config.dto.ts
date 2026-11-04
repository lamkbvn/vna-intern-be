import { IsBoolean } from 'class-validator';

export class UpdateReportConfigStatusDto {
  @IsBoolean()
  status: boolean;
}