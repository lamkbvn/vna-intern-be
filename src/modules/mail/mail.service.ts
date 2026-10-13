import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const port = Number(this.configService.get<number>('SMTP_PORT', 587));
    const secure =
      this.configService.get<string>('SMTP_SECURE') === 'true' || port === 465;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`SMTP configured for host: ${host} (${user})`);
    } else {
      this.logger.warn(
        'Chưa cấu hình SMTP trong file .env. Hệ thống sẽ in mã OTP ra console log khi gửi email.',
      );
    }
  }

  async sendResetPasswordOtp(
    to: string,
    otp: string,
    userInfo: { fullName: string; username: string },
  ): Promise<void> {
    const fromEnv = this.configService.get<string>('MAIL_FROM');
    const smtpUser = this.configService.get<string>('SMTP_USER');

    let from = fromEnv || `"Hệ Thống" <${smtpUser}>`;
    if (smtpUser && !from.includes('@')) {
      const cleanName = from.replace(/"/g, '').trim();
      from = `"${cleanName}" <${smtpUser}>`;
    }

    const textContent = `Xin chào, ${userInfo.fullName}

Bạn vừa yêu cầu khôi phục mật khẩu cho tài khoản ${userInfo.username}. Dưới đây là mã OTP của bạn: ${otp}

Lưu ý quan trọng: Mã OTP có hiệu lực trong 5 phút

Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên hỗ trợ.

Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0; padding: 24px; color: #111827; line-height: 1.6; font-size: 16px;">
        <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 24px 0; color: #000000; letter-spacing: -0.5px;">Xin chào, ${userInfo.fullName}</h1>
        
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Bạn vừa yêu cầu khôi phục mật khẩu cho tài khoản <strong>${userInfo.username}</strong>. Dưới đây là mã OTP của bạn: <strong>${otp}</strong>
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Lưu ý quan trọng: Mã OTP có hiệu lực trong <strong>5 phút</strong>
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên hỗ trợ.
        </p>
        
        <p style="margin: 0; font-size: 16px;">
          Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này
        </p>
      </div>
    `;

    this.logger.log(
      `Gửi OTP đặt lại mật khẩu tới: ${to} (${userInfo.fullName} - ${userInfo.username}) | Mã OTP: [ ${otp} ] (Hiệu lực: 5 phút)`,
    );

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject: '[Hệ thống] Mã OTP khôi phục mật khẩu',
          text: textContent,
          html: htmlContent,
        });
        this.logger.log(`Đã gửi email OTP thực tế thành công tới: ${to}`);
      } catch (error) {
        this.logger.error(`Lỗi khi gửi email qua SMTP tới ${to}:`, error);
      }
    }
  }

  async sendEmailChangeOtp(
    to: string,
    otp: string,
  ): Promise<void> {
    if (this.transporter)
      try {
        await this.transporter.sendMail({
          from: this.configService.getOrThrow<string>('MAIL_FROM'),
          to,
          subject: 'Mã OTP xác nhận đổi email', 
          text: [
            `Mã xác nhận đổi email của bạn là: ${otp}`,
            'Mã có hiệu lực trong 10 phút.',
            'Nếu bạn không yêu cầu đổi email, hãy bỏ qua email này.',
          ].join('\n'),
        });
        this.logger.log(`Đã gửi email OTP thực tế thành công tới: ${to}`);
      } catch (error) {
        this.logger.error(`Lỗi khi gửi email qua SMTP tới ${to}:`, error);
      }
  }



}
