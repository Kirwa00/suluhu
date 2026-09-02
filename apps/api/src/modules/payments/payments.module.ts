import { Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MockMpesaProvider, MPESA_PROVIDER, type MpesaProvider } from './providers/mpesa.provider';
import { PayHeroProvider } from './providers/payhero.provider';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    {
      provide: MPESA_PROVIDER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): MpesaProvider => {
        if (config.providers.mpesa === 'live') {
          return new PayHeroProvider(config.payhero);
        }
        return new MockMpesaProvider();
      },
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
