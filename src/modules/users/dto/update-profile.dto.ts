
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Gender } from '../user.entity.js';


export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string | null;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  province?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  district?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  streetAddress?: string | null;
}
