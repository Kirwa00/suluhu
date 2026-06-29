import { Module } from '@nestjs/common';
import { TherapistsModule } from '../therapists/therapists.module';
import { AdminTherapistsController } from './admin-therapists.controller';
import { AdminTherapistsService } from './admin-therapists.service';
import { AdminAlertsController } from './admin-alerts.controller';
import { AdminAlertsService } from './admin-alerts.service';

/**
 * Admin operations. Imports TherapistsModule to reuse the CPB verification
 * provider as a final approval gate.
 */
@Module({
  imports: [TherapistsModule],
  controllers: [AdminTherapistsController, AdminAlertsController],
  providers: [AdminTherapistsService, AdminAlertsService],
})
export class AdminModule {}
