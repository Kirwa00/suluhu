import { Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { MockVideoProvider, VIDEO_PROVIDER, type VideoProvider } from './providers/video.provider';
import { DailyVideoProvider } from './providers/daily.provider';

@Module({
  controllers: [SessionsController],
  providers: [
    SessionsService,
    {
      provide: VIDEO_PROVIDER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): VideoProvider => {
        if (config.providers.video === 'live') {
          return new DailyVideoProvider(config.daily);
        }
        return new MockVideoProvider();
      },
    },
  ],
  exports: [SessionsService],
})
export class SessionsModule {}
