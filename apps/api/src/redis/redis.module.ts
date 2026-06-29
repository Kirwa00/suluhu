import { Global, Logger, Module, type OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Redis from 'ioredis';
import { AppConfigService } from '../config/app-config.service';
import { REDIS_CLIENT } from './redis.constants';

/**
 * Provides a shared ioredis client used for sessions, rate limiting, OTP
 * throttling, and the refresh-token blocklist.
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): Redis => {
        const logger = new Logger('Redis');
        const client = new Redis(config.redis.url, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy: (times) => Math.min(times * 500, 10_000),
        });
        let loggedDown = false;
        client.on('ready', () => {
          loggedDown = false;
          logger.log('Connected to Redis');
        });
        // Swallow connection errors so a missing Redis doesn't crash the process;
        // commands will reject and surface as clean errors until it's reachable.
        client.on('error', (err) => {
          if (!loggedDown) {
            logger.error(`Redis unavailable: ${err.message}`);
            loggedDown = true;
          }
        });
        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown(): Promise<void> {
    const client = this.moduleRef.get<Redis>(REDIS_CLIENT, { strict: false });
    await client?.quit();
  }
}
