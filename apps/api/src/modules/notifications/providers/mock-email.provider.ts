import { Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';
import type { EmailMessage, EmailProvider, SendResult } from './notification.types';

/**
 * Mock email provider. Logs the message so flows like email verification and
 * password reset work in development without SMTP/SES. Swap for the live SES
 * adapter by setting EMAIL_MODE=live.
 */
export class MockEmailProvider implements EmailProvider {
  private readonly logger = new Logger('MockEmail');

  async send(message: EmailMessage): Promise<SendResult> {
    this.logger.log(`EMAIL → ${message.to}: ${message.subject}\n${message.text ?? message.html}`);
    return { providerMessageId: `mock-email-${nanoid(10)}`, accepted: true };
  }
}
