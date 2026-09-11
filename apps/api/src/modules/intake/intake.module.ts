import { Logger, Module } from '@nestjs/common';
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
        // Live OpenAI adapter (GPT-4o, §15.1 prompt) has not been built yet.
        if (config.providers.ai === 'live') {
          new Logger('Intake').warn(
            'AI_MODE=live requested but no live AI intake-summary adapter is configured; using the mock summary.',
          );
        }
        return new MockAiSummaryProvider();
      },
    },
  ],
  exports: [IntakeService],
})
export class IntakeModule {}
