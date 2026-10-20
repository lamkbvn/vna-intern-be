import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Gender, UserRole } from '../user.entity.js';

export class UpdateProfileDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

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

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string | null;

  @IsOptional()
  isActive?: boolean;
}
