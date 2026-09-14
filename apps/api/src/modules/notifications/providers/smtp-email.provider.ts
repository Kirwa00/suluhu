import { Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import type { EmailMessage, EmailProvider, SendResult } from './notification.types';

/**
 * SMTP email — live provider. Works with any SMTP relay — Resend (recommended,
 * see .env.example), AWS SES's SMTP interface, Mailgun, Postmark, etc. — the
 * platform isn't locked to a single vendor's SDK.
 */

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

export class SmtpEmailProvider implements EmailProvider {
  private readonly logger = new Logger('SmtpEmail');
  private readonly transporter: Transporter;

  constructor(private readonly config: SmtpConfig) {
    this.transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.password },
    });
  }

  async send(message: EmailMessage): Promise<SendResult> {
    try {
      const info = await this.transporter.sendMail({
        from: this.config.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
      this.logger.log(`EMAIL → ${message.to}: ${message.subject} (${info.messageId})`);
      const rejected = info.rejected?.length ?? 0;
      return { providerMessageId: info.messageId ?? '', accepted: rejected === 0 };
    } catch (error) {
      this.logger.error(
        `SMTP send to ${message.to} failed`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
