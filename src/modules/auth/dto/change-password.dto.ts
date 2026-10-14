import { IsNotEmpty, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @Length(6, 50, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu mới không được để trống' })
  confirmPassword: string;
}

