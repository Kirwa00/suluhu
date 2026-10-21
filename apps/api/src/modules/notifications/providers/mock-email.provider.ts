import { Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';
import type { EmailMessage, EmailProvider, SendResult } from './notification.types';

/**
 * Mock email provider. Logs the message so flows like email verification and
 * password reset work in development without SMTP/SES. Swap for the live SES
 * adapter by setting EMAIL_MODE=live.
 *
 * Also keeps the last message per recipient in memory, so e2e tests can read
 * back an OTP without a real email provider — see AuthController's test-only
 * `/auth/test/otp` route, which is itself gated to NODE_ENV==='test'.
 */
export class MockEmailProvider implements EmailProvider {
  private readonly logger = new Logger('MockEmail');
  private readonly lastByRecipient = new Map<string, string>();

  async send(message: EmailMessage): Promise<SendResult> {
    const body = message.text ?? message.html ?? '';
    this.logger.log(`EMAIL → ${message.to}: ${message.subject}\n${body}`);
    this.lastByRecipient.set(message.to, body);
    return { providerMessageId: `mock-email-${nanoid(10)}`, accepted: true };
  }

  getLast(to: string): string | undefined {
    return this.lastByRecipient.get(to);
  }
}
