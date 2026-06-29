import { Global, Logger, Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { NotificationsService } from './notifications.service';
import { RemindersService } from './reminders.service';
import { MockSmsProvider } from './providers/mock-sms.provider';
import { MockEmailProvider } from './providers/mock-email.provider';
import {
  EMAIL_PROVIDER,
  SMS_PROVIDER,
  type EmailProvider,
  type SmsProvider,
} from './providers/notification.types';

/**
 * Wires notification channels based on provider mode. Live adapters (Africa's
 * Talking, SES) land in the dedicated Notifications milestone; until then the
 * mock adapters keep every dependent flow runnable.
 */
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
          new Logger('Notifications').warn('Live SMS provider not yet configured; using mock');
        }
        return new MockSmsProvider();
      },
    },
    {
      provide: EMAIL_PROVIDER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): EmailProvider => {
        if (config.providers.email === 'live') {
          new Logger('Notifications').warn('Live email provider not yet configured; using mock');
        }
        return new MockEmailProvider();
      },
    },
  ],
  exports: [NotificationsService, RemindersService],
})
export class NotificationsModule {}
