import { Module } from '@nestjs/common';
import {
  AdminAnalyticsController,
  TherapistEarningsController,
} from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  controllers: [AdminAnalyticsController, TherapistEarningsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
