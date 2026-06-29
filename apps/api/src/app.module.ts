import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RATE_LIMIT_PER_USER_PER_MIN } from '@suluhu/shared';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CryptoModule } from './common/crypto/crypto.module';
import { HealthModule } from './health/health.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TherapistsModule } from './modules/therapists/therapists.module';
import { AdminModule } from './modules/admin/admin.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { IntakeModule } from './modules/intake/intake.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ClinicalModule } from './modules/clinical/clinical.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { MoodModule } from './modules/mood/mood.module';
import { ContentModule } from './modules/content/content.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

/**
 * Root module of the Suluhu modular monolith.
 *
 * Global infrastructure (config, db, cache, crypto, audit, notifications) is
 * shared by all feature modules. Security guards run globally in order:
 * throttle → authenticate → authorize. Routes opt out of auth with @Public().
 */
@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    RedisModule,
    CryptoModule,
    AuditModule,
    NotificationsModule,
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: RATE_LIMIT_PER_USER_PER_MIN }]),
    HealthModule,
    AuthModule,
    UsersModule,
    TherapistsModule,
    AdminModule,
    PaymentsModule,
    AppointmentsModule,
    IntakeModule,
    SessionsModule,
    ClinicalModule,
    MessagingModule,
    MoodModule,
    ContentModule,
    AnalyticsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
