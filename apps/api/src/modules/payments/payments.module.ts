import { Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MockMpesaProvider, MPESA_PROVIDER, type MpesaProvider } from './providers/mpesa.provider';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    {
      provide: MPESA_PROVIDER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): MpesaProvider => {
        // Live Daraja adapter swaps in here when MPESA_MODE=live + credentials set.
        void config;
        return new MockMpesaProvider();
      },
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
