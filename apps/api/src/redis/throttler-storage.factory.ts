import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import type { ThrottlerModuleOptions, ThrottlerOptions } from '@nestjs/throttler';
import { RATE_LIMIT_PER_USER_PER_MIN } from '@suluhu/shared';
import type Redis from 'ioredis';

/** The `{ throttlers, storage, ... }` member of the `ThrottlerModuleOptions` union (vs. the bare-array form). */
type ThrottlerModuleOptionsObject = Extract<
  ThrottlerModuleOptions,
  { throttlers: ThrottlerOptions[] }
>;

/**
 * Builds the throttler config for `ThrottlerModule.forRootAsync`, backed by
 * Redis so rate-limit counters are shared across horizontally scaled API
 * instances rather than each process tracking its own in-memory counters
 * (which would multiply the effective limit by instance count).
 *
 * Takes the app's existing shared Redis client — never opens a second
 * connection — since `ThrottlerStorageRedisService` only manages its own
 * connection when constructed with a URL/options instead of a live client.
 */
export function createThrottlerModuleOptions(redis: Redis): ThrottlerModuleOptionsObject {
  return {
    throttlers: [{ name: 'default', ttl: 60_000, limit: RATE_LIMIT_PER_USER_PER_MIN }],
    storage: new ThrottlerStorageRedisService(redis),
  };
}
