import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  newPassword: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu mới không được để trống' })
  confirmPassword: string;
}
