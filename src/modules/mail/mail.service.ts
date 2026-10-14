import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface MailAttachment {
  filename: string;
  path: string;
  cid: string;
}

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

  private getFromAddress(): string {
    const fromEnv = this.configService.get<string>('MAIL_FROM');
    const smtpUser = this.configService.get<string>('SMTP_USER');

    let from = fromEnv || `"VNA GROUP" <${smtpUser}>`;
    if (smtpUser && !from.includes('@')) {
      const cleanName = from.replace(/"/g, '').trim();
      from = `"${cleanName}" <${smtpUser}>`;
    }
    return from;
  }

  private getLogoConfig(): { attachments: MailAttachment[]; logoHtml: string } {
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'commons', 'assets', 'vnalogo.png'),
      path.join(process.cwd(), 'dist', 'commons', 'assets', 'vnalogo.png'),
      path.join(process.cwd(), '..', 'VNA-Intern-FE', 'public', 'vnalogo.png'),
    ];

    const foundPath = candidatePaths.find((p) => fs.existsSync(p));

    if (foundPath) {
      return {
        attachments: [
          {
            filename: 'vnalogo.png',
            path: foundPath,
            cid: 'vna-logo',
          },
        ],
        logoHtml: `
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="cid:vna-logo" alt="VNA GROUP" style="height: 60px; width: auto; display: inline-block;" />
          </div>
        `,
      };
    }

    return {
      attachments: [],
      logoHtml: '',
    };
  }

  async sendResetPasswordOtp(
    to: string,
    otp: string,
    userInfo: { fullName: string; username: string },
  ): Promise<void> {
    const from = this.getFromAddress();
    const logoConfig = this.getLogoConfig();

    const textContent = `Xin chào, ${userInfo.fullName}

Bạn vừa yêu cầu khôi phục mật khẩu cho tài khoản ${userInfo.username}. Dưới đây là mã OTP của bạn: ${otp}

Lưu ý quan trọng: Mã OTP có hiệu lực trong 5 phút

Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên hỗ trợ.

Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này`;

    const htmlContent = `
      <div style="background-color: #f3f4f6; padding: 40px 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; padding: 36px 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          ${logoConfig.logoHtml}
          
          <h1 style="font-size: 26px; font-weight: 700; margin: 0 0 24px 0; color: #000000; letter-spacing: -0.4px;">Xin chào, ${userInfo.fullName}</h1>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #111827;">
            Bạn vừa yêu cầu khôi phục mật khẩu cho tài khoản <strong>${userInfo.username}</strong>. Dưới đây là mã OTP của bạn: <strong>${otp}</strong>
          </p>
          
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #111827;">
            Lưu ý quan trọng: Mã OTP có hiệu lực trong <strong>5 phút</strong>
          </p>
          
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #111827;">
            Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên hỗ trợ.
          </p>
          
          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #111827;">
            Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này
          </p>
        </div>
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
          attachments: logoConfig.attachments,
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
    const from = this.getFromAddress();
    const logoConfig = this.getLogoConfig();

    const textContent = `Mã xác nhận đổi email của bạn là: ${otp}
Mã có hiệu lực trong 10 phút.
Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên hỗ trợ.
Nếu bạn không yêu cầu đổi email, hãy bỏ qua email này.`;

    const htmlContent = `
      <div style="background-color: #f3f4f6; padding: 40px 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; padding: 36px 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          ${logoConfig.logoHtml}
          
          <h1 style="font-size: 26px; font-weight: 700; margin: 0 0 24px 0; color: #000000; letter-spacing: -0.4px;">Xác nhận đổi email</h1>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #111827;">
            Bạn vừa yêu cầu thay đổi email liên kết với tài khoản. Dưới đây là mã OTP của bạn: <strong>${otp}</strong>
          </p>
          
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #111827;">
            Lưu ý quan trọng: Mã OTP có hiệu lực trong <strong>10 phút</strong>
          </p>
          
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #111827;">
            Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên hỗ trợ.
          </p>
          
          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #111827;">
            Nếu bạn không yêu cầu đổi email, vui lòng bỏ qua email này
          </p>
        </div>
      </div>
    `;

    this.logger.log(
      `Gửi OTP đổi email tới: ${to} | Mã OTP: [ ${otp} ] (Hiệu lực: 10 phút)`,
    );

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject: '[Hệ thống] Mã OTP xác nhận đổi email',
          text: textContent,
          html: htmlContent,
          attachments: logoConfig.attachments,
        });
        this.logger.log(`Đã gửi email OTP thực tế thành công tới: ${to}`);
      } catch (error) {
        this.logger.error(`Lỗi khi gửi email qua SMTP tới ${to}:`, error);
      }
    }
  }
}
