import { Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';
import type { SendResult, SmsMessage, SmsProvider } from './notification.types';

/**
 * Mock SMS provider. Logs the message (including any OTP) so the platform is
 * fully usable in development without Africa's Talking credentials. Swap for
 * the live Africa's Talking adapter by setting SMS_MODE=live.
 */
export class MockSmsProvider implements SmsProvider {
  private readonly logger = new Logger('MockSMS');

  async send(message: SmsMessage): Promise<SendResult> {
    this.logger.log(`SMS → ${message.to}: ${message.body}`);
    return { providerMessageId: `mock-sms-${nanoid(10)}`, accepted: true };
  }
}
