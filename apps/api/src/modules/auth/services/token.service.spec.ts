import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode, UserRole, type AuthUser } from '@suluhu/shared';
import { createHash } from 'node:crypto';
import type Redis from 'ioredis';
import { AppException } from '../../../common/exceptions/app.exception';
import type { AppConfigService } from '../../../config/app-config.service';
import type { PrismaService } from '../../../prisma/prisma.service';
import { TokenService, parseDuration, toAuthUser } from './token.service';

const USER: AuthUser = {
  id: 'u1',
  email: 'asha@example.com',
  role: UserRole.PATIENT,
  status: 'ACTIVE',
  mfaEnabled: false,
};

const CONFIG = {
  jwt: {
    accessSecret: 'access-secret',
    refreshSecret: 'refresh-secret',
    accessTtl: '15m',
    refreshTtl: '7d',
  },
} as unknown as AppConfigService;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function makePrisma(overrides: { existing?: unknown } = {}) {
  return {
    refreshToken: {
      create: jest.fn().mockResolvedValue({ id: 'rt1' }),
      findUnique: jest.fn().mockResolvedValue(overrides.existing ?? null),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };
}

function makeRedis(overrides: { exists?: number; existsError?: Error } = {}) {
  return {
    set: jest.fn().mockResolvedValue('OK'),
    exists: overrides.existsError
      ? jest.fn().mockRejectedValue(overrides.existsError)
      : jest.fn().mockResolvedValue(overrides.exists ?? 0),
  };
}

function build(overrides: { existing?: unknown; exists?: number; existsError?: Error } = {}) {
  const prisma = makePrisma(overrides);
  const redis = makeRedis(overrides);
  const service = new TokenService(
    new JwtService(),
    CONFIG,
    prisma as unknown as PrismaService,
    redis as unknown as Redis,
  );
  return { service, prisma, redis };
}

describe('parseDuration', () => {
  it.each([
    ['30s', 30],
    ['15m', 900],
    ['2h', 7200],
    ['7d', 604800],
    [' 15m ', 900],
    ['45', 45],
  ])('parses %s into %i seconds', (input, expected) => {
    expect(parseDuration(input)).toBe(expected);
  });

  it('rejects a non-numeric, non-duration value', () => {
    expect(() => parseDuration('forever')).toThrow('Invalid duration: forever');
  });
});

describe('toAuthUser', () => {
  it('projects only the auth-relevant fields of a user row', () => {
    expect(
      toAuthUser({ ...USER, passwordHash: 'secret' } as unknown as Parameters<
        typeof toAuthUser
      >[0]),
    ).toEqual(USER);
  });
});

describe('TokenService', () => {
  it('issues an access token plus an opaque refresh token stored only as a hash', async () => {
    const { service, prisma } = build();
    const tokens = await service.issueTokens(USER, { ipAddress: '41.90.1.1', userAgent: 'jest' });

    expect(tokens.expiresIn).toBe(900);
    expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
    const { data } = prisma.refreshToken.create.mock.calls[0][0] as {
      data: { tokenHash: string; userId: string; ipAddress: string; userAgent: string };
    };
    expect(data.tokenHash).toBe(hashToken(tokens.refreshToken));
    expect(data.tokenHash).not.toBe(tokens.refreshToken);
    expect(data).toMatchObject({ userId: 'u1', ipAddress: '41.90.1.1', userAgent: 'jest' });
  });

  it('stores nulls when the request context has no ip or user agent', async () => {
    const { service, prisma } = build();
    await service.issueTokens(USER, {});
    expect(prisma.refreshToken.create.mock.calls[0][0]).toMatchObject({
      data: { ipAddress: null, userAgent: null },
    });
  });

  it('round-trips an access token payload', async () => {
    const { service } = build();
    const token = await service.signAccessToken(USER);
    const payload = await service.verifyAccessToken(token);
    expect(payload).toMatchObject({
      sub: 'u1',
      email: 'asha@example.com',
      role: UserRole.PATIENT,
      status: 'ACTIVE',
      mfaEnabled: false,
    });
    expect(payload.jti).toHaveLength(36);
  });

  it('rejects a tampered access token as expired/invalid', async () => {
    const { service } = build();
    await expect(service.verifyAccessToken('not-a-jwt')).rejects.toMatchObject({
      code: ErrorCode.AUTH_TOKEN_EXPIRED,
    });
  });

  it('rejects an access token whose jti is blocklisted', async () => {
    const { service, redis } = build({ exists: 1 });
    const token = await service.signAccessToken(USER);
    await expect(service.verifyAccessToken(token)).rejects.toMatchObject({
      code: ErrorCode.AUTH_TOKEN_INVALID,
    });
    expect(redis.exists).toHaveBeenCalledWith(expect.stringContaining('auth:access:blocklist:'));
  });

  it('fails open — allows a valid, unexpired token when Redis is unavailable for the revocation check', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const { service, redis } = build({ existsError: new Error('Connection is closed.') });
    const token = await service.signAccessToken(USER);

    const payload = await service.verifyAccessToken(token);

    expect(payload).toMatchObject({ sub: 'u1', email: 'asha@example.com' });
    expect(redis.exists).toHaveBeenCalledWith(expect.stringContaining('auth:access:blocklist:'));
    expect(warn).toHaveBeenCalledTimes(1);
    const [message] = warn.mock.calls[0] as [string];
    expect(message).toMatch(/redis unavailable/i);
    expect(message).toMatch(/fail-open/i);
    // Never log token/secret material, only the operational reason.
    expect(message).not.toContain(token);
    warn.mockRestore();
  });

  it('blocklists a jti for the access-token lifetime', async () => {
    const { service, redis } = build();
    await service.blocklistAccess('jti1');
    expect(redis.set).toHaveBeenCalledWith('auth:access:blocklist:jti1', '1', 'EX', 900);
  });

  it('round-trips an MFA challenge token', async () => {
    const { service } = build();
    const challenge = await service.signMfaChallenge('u1');
    await expect(service.verifyMfaChallenge(challenge)).resolves.toBe('u1');
  });

  it('refuses to accept an access token as an MFA challenge', async () => {
    const { service } = build();
    const accessToken = await service.signAccessToken(USER);
    await expect(service.verifyMfaChallenge(accessToken)).rejects.toBeInstanceOf(AppException);
  });

  describe('rotateRefreshToken', () => {
    const activeRecord = {
      id: 'rt1',
      userId: 'u1',
      familyId: 'fam1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: { ...USER, passwordHash: 'secret' },
    };

    it('revokes the presented token and issues a new one in the same family', async () => {
      const { service, prisma } = build({ existing: activeRecord });
      const result = await service.rotateRefreshToken('raw-token', { ipAddress: null });

      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: hashToken('raw-token') },
        include: { user: true },
      });
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt1' },
        data: { revokedAt: expect.any(Date) },
      });
      expect(prisma.refreshToken.create.mock.calls[0][0]).toMatchObject({
        data: { familyId: 'fam1', userId: 'u1' },
      });
      expect(result.user).toEqual(USER);
      expect(result.tokens.refreshToken).not.toBe('raw-token');
    });

    it('rejects an unknown refresh token', async () => {
      const { service, prisma } = build();
      await expect(service.rotateRefreshToken('raw-token', {})).rejects.toMatchObject({
        code: ErrorCode.AUTH_TOKEN_INVALID,
      });
      expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
    });

    it('revokes the whole family when an already-revoked token is replayed', async () => {
      const { service, prisma } = build({
        existing: { ...activeRecord, revokedAt: new Date('2025-01-01T00:00:00.000Z') },
      });
      await expect(service.rotateRefreshToken('raw-token', {})).rejects.toMatchObject({
        message: 'Refresh token reuse detected',
      });
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { familyId: 'fam1', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('treats an expired token as reuse and revokes the family', async () => {
      const { service, prisma } = build({
        existing: { ...activeRecord, expiresAt: new Date(Date.now() - 1000) },
      });
      await expect(service.rotateRefreshToken('raw-token', {})).rejects.toBeInstanceOf(
        AppException,
      );
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledTimes(1);
    });
  });

  it('revokes a single refresh token by hash', async () => {
    const { service, prisma } = build();
    await service.revokeRefreshToken('raw-token');
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { tokenHash: hashToken('raw-token'), revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('revokes every active session for a user', async () => {
    const { service, prisma } = build();
    await service.revokeAllForUser('u1');
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});
