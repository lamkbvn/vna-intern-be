import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Gender } from '../user.entity.js';


export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  username: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string | null;

  @IsOptional()
  @IsString()
  province?: string | null;

  @IsOptional()
  @IsString()
  district?: string | null;

  @IsOptional()
  @IsString()
  streetAddress?: string | null;
}