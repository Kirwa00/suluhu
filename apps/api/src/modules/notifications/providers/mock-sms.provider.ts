import { Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';
import type { SendResult, SmsMessage, SmsProvider } from './notification.types';

/**
 * Mock SMS provider. Logs the message (including any OTP) so the platform is
 * fully usable in development without Africa's Talking credentials. Swap for
 * the live Africa's Talking adapter by setting SMS_MODE=live.
 *
 * Also keeps the last message per recipient in memory, so e2e tests can read
 * back an OTP without a real SMS provider — see AuthController's test-only
 * `/auth/test/otp` route, which is itself gated to NODE_ENV==='test'.
 */
export class MockSmsProvider implements SmsProvider {
  private readonly logger = new Logger('MockSMS');
  private readonly lastByRecipient = new Map<string, string>();

  async send(message: SmsMessage): Promise<SendResult> {
    this.logger.log(`SMS → ${message.to}: ${message.body}`);
    this.lastByRecipient.set(message.to, message.body);
    return { providerMessageId: `mock-sms-${nanoid(10)}`, accepted: true };
  }

  getLast(to: string): string | undefined {
    return this.lastByRecipient.get(to);
  }
}
