import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditEntry {
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  phiAccessed?: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Append-only audit trail (SDLC §2.3, §7.3). Writes must never throw into the
 * caller's path — a failed audit write is logged but does not break the user
 * action; an alerting hook can be attached here. Records are never updated or
 * deleted at the application layer (7-year retention).
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId ?? null,
          action: entry.action,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId ?? null,
          phiAccessed: entry.phiAccessed ?? false,
          ipAddress: entry.ipAddress ?? null,
          userAgent: entry.userAgent ?? null,
          metadata: (entry.metadata as object) ?? undefined,
        },
      });
    } catch (error) {
      // Never block the primary action; surface for ops follow-up.
      this.logger.error(
        `Failed to write audit log for action=${entry.action}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
