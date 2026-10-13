import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'email phải đúng định dạng' })
  email: string;

  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @Length(6, 6, { message: 'Mã OTP phải có độ dài 6 chữ số' })
  otp: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @Length(6, 50, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}
