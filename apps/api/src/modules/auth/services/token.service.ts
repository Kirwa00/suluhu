import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthTokens, AuthUser } from '@suluhu/shared';
import { randomBytes, createHash, randomUUID } from 'node:crypto';
import type Redis from 'ioredis';
import { AppConfigService } from '../../../config/app-config.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../../redis/redis.constants';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '@suluhu/shared';
import type { AccessTokenPayload, MfaChallengePayload, RequestContext } from '../types';

const ACCESS_BLOCKLIST_PREFIX = 'auth:access:blocklist:';

/**
 * Issues and validates JWT access tokens and opaque, rotating refresh tokens
 * (SDLC §7.2). Refresh tokens are stored only as SHA-256 hashes; presenting a
 * already-rotated token revokes the whole family (reuse detection).
 */
@Injectable()
export class TokenService {
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlMs: number;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    this.accessTtlSeconds = parseDuration(config.jwt.accessTtl);
    this.refreshTtlMs = parseDuration(config.jwt.refreshTtl) * 1000;
  }

  async issueTokens(user: AuthUser, ctx: RequestContext): Promise<AuthTokens> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id, randomUUID(), ctx);
    return { accessToken, refreshToken, expiresIn: this.accessTtlSeconds };
  }

  async signAccessToken(user: AuthUser): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      mfaEnabled: user.mfaEnabled,
      jti: randomUUID(),
    };
    return this.jwt.signAsync(payload, {
      secret: this.config.jwt.accessSecret,
      expiresIn: this.config.jwt.accessTtl,
    });
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    let payload: AccessTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.config.jwt.accessSecret,
      });
    } catch {
      throw AppException.unauthorized('Session expired or invalid', ErrorCode.AUTH_TOKEN_EXPIRED);
    }
    if (await this.isAccessRevoked(payload.jti)) {
      throw AppException.unauthorized('Session has been revoked', ErrorCode.AUTH_TOKEN_INVALID);
    }
    return payload;
  }

  /** Issues a short-lived (5-min) MFA challenge token after a valid password. */
  async signMfaChallenge(userId: string): Promise<string> {
    const payload: MfaChallengePayload = { sub: userId, purpose: 'mfa', jti: randomUUID() };
    return this.jwt.signAsync(payload, {
      secret: this.config.jwt.accessSecret,
      expiresIn: '5m',
    });
  }

  async verifyMfaChallenge(token: string): Promise<string> {
    try {
      const payload = await this.jwt.verifyAsync<MfaChallengePayload>(token, {
        secret: this.config.jwt.accessSecret,
      });
      if (payload.purpose !== 'mfa') throw new Error('wrong purpose');
      return payload.sub;
    } catch {
      throw AppException.unauthorized('MFA session expired, please log in again', ErrorCode.AUTH_TOKEN_EXPIRED);
    }
  }

  /**
   * Rotates a refresh token: validates the presented token, revokes it, and
   * issues a fresh one in the same family. Detects reuse of an already-revoked
   * token and revokes the entire family as a precaution.
   */
  async rotateRefreshToken(
    rawToken: string,
    ctx: RequestContext,
  ): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const tokenHash = hashToken(rawToken);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existing) {
      throw AppException.unauthorized('Invalid refresh token', ErrorCode.AUTH_TOKEN_INVALID);
    }

    if (existing.revokedAt || existing.expiresAt < new Date()) {
      // Reuse of a revoked/expired token → revoke the whole lineage.
      await this.prisma.refreshToken.updateMany({
        where: { familyId: existing.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw AppException.unauthorized('Refresh token reuse detected', ErrorCode.AUTH_TOKEN_INVALID);
    }

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    const authUser = toAuthUser(existing.user);
    const accessToken = await this.signAccessToken(authUser);
    const refreshToken = await this.createRefreshToken(existing.userId, existing.familyId, ctx);
    return {
      user: authUser,
      tokens: { accessToken, refreshToken, expiresIn: this.accessTtlSeconds },
    };
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Revokes every active session for a user (used on password change). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Adds an access token's jti to the Redis blocklist until its natural expiry. */
  async blocklistAccess(jti: string): Promise<void> {
    await this.redis.set(`${ACCESS_BLOCKLIST_PREFIX}${jti}`, '1', 'EX', this.accessTtlSeconds);
  }

  private async isAccessRevoked(jti: string): Promise<boolean> {
    return (await this.redis.exists(`${ACCESS_BLOCKLIST_PREFIX}${jti}`)) === 1;
  }

  private async createRefreshToken(
    userId: string,
    familyId: string,
    ctx: RequestContext,
  ): Promise<string> {
    const rawToken = randomBytes(48).toString('base64url');
    await this.prisma.refreshToken.create({
      data: {
        userId,
        familyId,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + this.refreshTtlMs),
        userAgent: ctx.userAgent ?? null,
        ipAddress: ctx.ipAddress ?? null,
      },
    });
    return rawToken;
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function toAuthUser(user: {
  id: string;
  email: string;
  role: AuthUser['role'];
  status: string;
  mfaEnabled: boolean;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    mfaEnabled: user.mfaEnabled,
  };
}

/** Parses durations like `15m`, `7d`, `30s`, `2h` into seconds. */
export function parseDuration(value: string): number {
  const match = /^(\d+)\s*([smhd])$/.exec(value.trim());
  if (!match) {
    const asNumber = Number(value);
    if (!Number.isNaN(asNumber)) return asNumber;
    throw new Error(`Invalid duration: ${value}`);
  }
  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * (multipliers[unit as string] ?? 1);
}
