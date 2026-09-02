import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { RATE_LIMIT_PER_USER_PER_MIN } from '@suluhu/shared';
import Redis from 'ioredis';
import { createThrottlerModuleOptions } from './throttler-storage.factory';

describe('createThrottlerModuleOptions', () => {
  // A real (but never actually connecting, per lazyConnect) ioredis instance:
  // ThrottlerStorageRedisService only preserves the exact client reference
  // for an `instanceof Redis` value — anything else (including a plain
  // mock object) is treated as connection options and used to open a brand
  // new client, which is precisely the "second connection" this factory
  // exists to avoid. So the test has to exercise the real class.
  let sharedRedis: Redis;

  beforeEach(() => {
    sharedRedis = new Redis({ lazyConnect: true });
  });

  afterEach(() => {
    sharedRedis.disconnect();
  });

  it('configures a Redis-backed storage adapter wrapping the given (shared) client', () => {
    const options = createThrottlerModuleOptions(sharedRedis);

    expect(options.storage).toBeInstanceOf(ThrottlerStorageRedisService);
    const storage = options.storage as ThrottlerStorageRedisService;
    // Same reference as the injected client — proves no second Redis
    // connection is created; the adapter just wraps the shared one.
    expect(storage.redis).toBe(sharedRedis);
    // ThrottlerStorageRedisService only opens (and later disconnects) its
    // own connection when constructed with a URL/options instead of a live
    // client — this must stay false so app shutdown never closes the shared
    // client out from under the rest of the app.
    expect(storage.disconnectRequired).toBeFalsy();
  });

  it('preserves the existing default ttl and per-user limit', () => {
    const options = createThrottlerModuleOptions(sharedRedis);

    expect(options.throttlers).toEqual([
      { name: 'default', ttl: 60_000, limit: RATE_LIMIT_PER_USER_PER_MIN },
    ]);
  });
});
