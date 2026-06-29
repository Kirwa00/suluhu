import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, paginationQuerySchema, uuidSchema } from '@suluhu/shared';
import { z } from 'zod';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { buildRequestContext } from '../../common/http/request-context';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';
import { RemindersService } from '../notifications/reminders.service';

const auditQuerySchema = paginationQuerySchema.extend({ action: z.string().trim().optional() });

@ApiTags('Admin · Analytics')
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminAnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly reminders: RemindersService,
  ) {}

  @Get('reminders/stats')
  @ApiOperation({ summary: 'Appointment-reminder queue stats' })
  reminderStats() {
    return this.reminders.stats();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Platform KPIs' })
  metrics() {
    return this.analytics.adminMetrics();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue by therapist' })
  revenue() {
    return this.analytics.revenueByTherapist();
  }

  @Get('payouts')
  @ApiOperation({ summary: 'Therapist payout queue with pending balances' })
  payouts() {
    return this.analytics.payoutQueue();
  }

  @Post('payouts/:therapistId/pay')
  @ApiOperation({ summary: 'Pay out a therapist (mock M-Pesa B2C)' })
  pay(
    @Param('therapistId', new ZodValidationPipe(uuidSchema)) therapistId: string,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    return this.analytics.payTherapist(adminId, therapistId, buildRequestContext(req));
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Immutable audit log viewer' })
  audit(@Query(new ZodValidationPipe(auditQuerySchema)) query: z.infer<typeof auditQuerySchema>) {
    return this.analytics.auditLog(query);
  }
}

@ApiTags('Therapist · Earnings')
@Roles(UserRole.THERAPIST)
@Controller('therapist')
export class TherapistEarningsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('earnings')
  @ApiOperation({ summary: 'My earnings, transactions and payouts' })
  earnings(@CurrentUser('id') userId: string) {
    return this.analytics.therapistEarnings(userId);
  }
}
