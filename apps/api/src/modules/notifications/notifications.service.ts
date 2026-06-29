import { Inject, Injectable } from '@nestjs/common';
import {
  EMAIL_PROVIDER,
  SMS_PROVIDER,
  type EmailMessage,
  type EmailProvider,
  type SmsMessage,
  type SmsProvider,
} from './providers/notification.types';

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
}
