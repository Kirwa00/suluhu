import { Logger, Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { ClinicalController } from './clinical.controller';
import { ClinicalAccessService } from './clinical-access.service';
import { ClinicalNotesService } from './clinical-notes.service';
import { TreatmentPlansService } from './treatment-plans.service';
import { HealthRecordService } from './health-record.service';
import {
  AI_SOAP_PROVIDER,
  MockAiSoapProvider,
  type AiSoapProvider,
} from './providers/ai-soap.provider';

@Module({
  controllers: [ClinicalController],
  providers: [
    ClinicalAccessService,
    ClinicalNotesService,
    TreatmentPlansService,
    HealthRecordService,
    {
      provide: AI_SOAP_PROVIDER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): AiSoapProvider => {
        // SOAP notes are written directly by the therapist (see
        // ClinicalNotesService.upsert) — this AI draft is an optional assist,
        // not required for storage, so there's no live OpenAI adapter yet.
        if (config.providers.ai === 'live') {
          new Logger('Clinical').warn(
            'AI_MODE=live requested but no live AI SOAP-draft adapter is configured; using the mock draft assist.',
          );
        }
        return new MockAiSoapProvider();
      },
    },
  ],
})
export class ClinicalModule {}
