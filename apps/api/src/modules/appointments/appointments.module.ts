import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { AppointmentsController } from './appointments.controller';
import { SlotsController } from './slots.controller';
import { AppointmentsService } from './appointments.service';
import { SlotsService } from './slots.service';

@Module({
  imports: [PaymentsModule],
  controllers: [AppointmentsController, SlotsController],
  providers: [AppointmentsService, SlotsService],
  exports: [AppointmentsService, SlotsService],
})
export class AppointmentsModule {}
