import { Inject, Injectable } from '@nestjs/common';
import {
  EMAIL_PROVIDER,
  SMS_PROVIDER,
  type EmailMessage,
  type EmailProvider,
  type SmsMessage,
  type SmsProvider,
} from './providers/notification.types';
import { MockEmailProvider } from './providers/mock-email.provider';
import { MockSmsProvider } from './providers/mock-sms.provider';

/**
 * Facade over notification channels. Higher-level modules (auth, appointments)
 * depend on this rather than concrete providers, so channels can be swapped or
 * extended (push, in-app) without touching callers.
 */
@Injectable()
export class NotificationsService {
  constructor(
    @Inject(SMS_PROVIDER) private readonly sms: SmsProvider,
    @Inject(EMAIL_PROVIDER) private readonly email: EmailProvider,
  ) {}

  sendSms(message: SmsMessage) {
    return this.sms.send(message);
  }

  sendEmail(message: EmailMessage) {
    return this.email.send(message);
  }

  /**
   * Test-only: the last message sent to a recipient, when the configured
   * provider is the mock one (SMS_MODE/EMAIL_MODE !== 'live'). Undefined
   * otherwise — live providers never retain message content.
   */
  getLastMockMessage(to: string): string | undefined {
    if (this.sms instanceof MockSmsProvider) {
      const sms = this.sms.getLast(to);
      if (sms) return sms;
    }
    if (this.email instanceof MockEmailProvider) {
      return this.email.getLast(to);
    }
    return undefined;
  }
}
