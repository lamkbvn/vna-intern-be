import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { Gender, UserRole } from '../user.entity.js';

export class CreateUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @Length(4, 30, { message: 'Tên đăng nhập phải có độ dài từ 4 đến 30 ký tự' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (_)' })
  username: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @Length(2, 100, { message: 'Họ và tên phải có độ dài từ 2 đến 100 ký tự' })
  @Matches(/^[\p{L}\p{M}\s]+$/u, { message: 'Họ và tên chỉ được chứa chữ cái, không chứa số hoặc ký tự đặc biệt' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày tháng năm sinh không đúng định dạng' })
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
