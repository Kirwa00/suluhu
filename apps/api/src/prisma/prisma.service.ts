import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma client wired into the Nest lifecycle. Connects on module init and
 * disconnects on shutdown. Exposes a `softDeleteWhere` helper for the
 * platform's soft-delete convention.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL');
    } catch (error) {
      // Don't crash the whole app if the DB isn't up yet (e.g. local dev before
      // a database is provisioned). Log clearly and retry in the background so
      // the API and its health probes still boot; DB-backed routes return a
      // clean error until the connection succeeds.
      this.logger.error(
        `Could not connect to PostgreSQL on boot: ${(error as Error).message}. Retrying in background…`,
      );
      void this.retryConnect();
    }
  }

  private async retryConnect(attempt = 1): Promise<void> {
    const delayMs = Math.min(30_000, 2_000 * attempt);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL (after retry)');
    } catch {
      if (attempt < 50) void this.retryConnect(attempt + 1);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /** Standard predicate for excluding soft-deleted rows. */
  static notDeleted = { deletedAt: null } as const;
}
