import { Logger, Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { TherapistsController } from './therapists.controller';
import { DiscoveryController } from './discovery.controller';
import { TherapistsService } from './therapists.service';
import { DiscoveryService } from './discovery.service';
import { TherapistDocumentsController } from './documents/therapist-documents.controller';
import { TherapistDocumentsService } from './documents/therapist-documents.service';
import { LocalDocumentStorageService } from './documents/local-document-storage.service';
import {
  CPB_VERIFICATION_PROVIDER,
  MockCpbVerificationProvider,
  type CpbVerificationProvider,
} from './providers/cpb-verification.provider';

@Module({
  controllers: [TherapistsController, DiscoveryController, TherapistDocumentsController],
  providers: [
    TherapistsService,
    DiscoveryService,
    TherapistDocumentsService,
    LocalDocumentStorageService,
    {
      provide: CPB_VERIFICATION_PROVIDER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): CpbVerificationProvider => {
        // No live CPB-portal integration exists yet — verification is done by
        // an admin reviewing the documents the therapist uploads. This check
        // just keeps the license-format plausibility check the mock provides.
        if (config.providers.default === 'live') {
          new Logger('Therapists').warn(
            'PROVIDER_MODE=live requested but no live CPB-portal adapter is configured; using mock format check. Verification is manual via uploaded documents.',
          );
        }
        return new MockCpbVerificationProvider();
      },
    },
  ],
  exports: [CPB_VERIFICATION_PROVIDER],
})
export class TherapistsModule {}
