import { Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { MockVideoProvider, VIDEO_PROVIDER, type VideoProvider } from './providers/video.provider';

@Module({
  controllers: [SessionsController],
  providers: [
    SessionsService,
    {
      provide: VIDEO_PROVIDER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): VideoProvider => {
        // Live Daily.co adapter swaps in when VIDEO_MODE=live + DAILY_API_KEY set.
        void config;
        return new MockVideoProvider();
      },
    },
  ],
  exports: [SessionsService],
})
export class SessionsModule {}
