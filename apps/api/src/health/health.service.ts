import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.constants';

export type ComponentStatus = 'up' | 'down';

export interface HealthReport {
  status: 'ok' | 'degraded';
  uptimeSeconds: number;
  components: Record<string, { status: ComponentStatus; latencyMs?: number; error?: string }>;
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async check(): Promise<HealthReport> {
    const [db, cache] = await Promise.all([this.checkDatabase(), this.checkRedis()]);
    const components = { database: db, redis: cache };
    const allUp = Object.values(components).every((c) => c.status === 'up');
    return {
      status: allUp ? 'ok' : 'degraded',
      uptimeSeconds: Math.round(process.uptime()),
      components,
    };
  }

  async isReady(): Promise<boolean> {
    const [db, cache] = await Promise.all([this.checkDatabase(), this.checkRedis()]);
    return db.status === 'up' && cache.status === 'up';
  }

  private async checkDatabase() {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'up' as const, latencyMs: Date.now() - start };
    } catch (error) {
      return { status: 'down' as const, error: (error as Error).message };
    }
  }

  private async checkRedis() {
    const start = Date.now();
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG'
        ? { status: 'up' as const, latencyMs: Date.now() - start }
        : { status: 'down' as const, error: `unexpected ping reply: ${pong}` };
    } catch (error) {
      return { status: 'down' as const, error: (error as Error).message };
    }
  }
}
