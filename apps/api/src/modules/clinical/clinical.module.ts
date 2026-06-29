import { Module } from '@nestjs/common';
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
      // Live OpenAI adapter (GPT-4o, §15.2 prompt) swaps in when AI_MODE=live.
      useFactory: (): AiSoapProvider => new MockAiSoapProvider(),
    },
  ],
})
export class ClinicalModule {}
