import { IsEmail } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail({}, { message: 'Email không hợp lệ , vui lòng kiểm tra lại dữ liệu' })
  newEmail: string;
}
