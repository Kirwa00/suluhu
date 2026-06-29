import { Module } from '@nestjs/common';
import { TherapistsController } from './therapists.controller';
import { DiscoveryController } from './discovery.controller';
import { TherapistsService } from './therapists.service';
import { DiscoveryService } from './discovery.service';
import {
  CPB_VERIFICATION_PROVIDER,
  MockCpbVerificationProvider,
  type CpbVerificationProvider,
} from './providers/cpb-verification.provider';

@Module({
  controllers: [TherapistsController, DiscoveryController],
  providers: [
    TherapistsService,
    DiscoveryService,
    {
      provide: CPB_VERIFICATION_PROVIDER,
      // Live CPB-portal adapter swaps in here when credentials are available.
      useFactory: (): CpbVerificationProvider => new MockCpbVerificationProvider(),
    },
  ],
  exports: [CPB_VERIFICATION_PROVIDER],
})
export class TherapistsModule {}
