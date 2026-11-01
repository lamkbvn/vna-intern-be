import { IsString, Length, Matches } from 'class-validator';

export class VerifyEmailChangeDto {
  @IsString({ message: 'Mã OTP không chính xác, vui lòng kiểm tra lại' })
  @Length(6, 6, { message: 'Mã OTP không chính xác, vui lòng kiểm tra lại' })
  @Matches(/^\d{6}$/, { message: 'Mã OTP không chính xác, vui lòng kiểm tra lại' })
  otp: string;
}
