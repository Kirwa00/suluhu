import { Global, Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { NotificationsService } from './notifications.service';
import { RemindersService } from './reminders.service';
import { MockSmsProvider } from './providers/mock-sms.provider';
import { MockEmailProvider } from './providers/mock-email.provider';
import { AfricasTalkingSmsProvider } from './providers/africas-talking-sms.provider';
import { SmtpEmailProvider } from './providers/smtp-email.provider';
import {
  EMAIL_PROVIDER,
  SMS_PROVIDER,
  type EmailProvider,
  type SmsProvider,
} from './providers/notification.types';

/** Wires notification channels to the live adapter when SMS_MODE/EMAIL_MODE=live. */
@Global()
@Module({
  providers: [
    NotificationsService,
    RemindersService,
    {
      provide: SMS_PROVIDER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): SmsProvider => {
        if (config.providers.sms === 'live') {
          return new AfricasTalkingSmsProvider(config.africasTalking);
        }
        return new MockSmsProvider();
      },
    },
    {
      provide: EMAIL_PROVIDER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): EmailProvider => {
        if (config.providers.email === 'live') {
          return new SmtpEmailProvider(config.smtp);
        }
        return new MockEmailProvider();
      },
    },
  ],
  exports: [NotificationsService, RemindersService],
})
export class NotificationsModule {}
