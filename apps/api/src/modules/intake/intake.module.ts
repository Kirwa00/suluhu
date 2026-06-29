import { Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { IntakeController } from './intake.controller';
import { IntakeService } from './intake.service';
import {
  AI_SUMMARY_PROVIDER,
  MockAiSummaryProvider,
  type AiSummaryProvider,
} from './providers/ai-summary.provider';

@Module({
  controllers: [IntakeController],
  providers: [
    IntakeService,
    {
      provide: AI_SUMMARY_PROVIDER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): AiSummaryProvider => {
        // Live OpenAI adapter (GPT-4o, §15.1 prompt) swaps in when AI_MODE=live.
        void config;
        return new MockAiSummaryProvider();
      },
    },
  ],
  exports: [IntakeService],
})
export class IntakeModule {}
