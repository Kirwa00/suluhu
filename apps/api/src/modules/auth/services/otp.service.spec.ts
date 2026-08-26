import { Logger } from '@nestjs/common';
import {
  ErrorCode,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_SECONDS,
  VerificationPurpose,
} from '@suluhu/shared';
import { createHash } from 'node:crypto';
import type Redis from 'ioredis';
import type { PrismaService } from '../../../prisma/prisma.service';
import type { NotificationsService } from '../../notifications/notifications.service';
import { OtpService } from './otp.service';

const USER_ID = 'u1';

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

function build(overrides: { record?: unknown; requestCount?: number } = {}) {
  const prisma = {
    verificationCode: {
      create: jest.fn().mockResolvedValue({ id: 'vc1' }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findFirst: jest.fn().mockResolvedValue(overrides.record ?? null),
    },
  };
  const notifications = {
    sendSms: jest.fn().mockResolvedValue(undefined),
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };
  const redis = {
    incr: jest.fn().mockResolvedValue(overrides.requestCount ?? 1),
    expire: jest.fn().mockResolvedValue(1),
  };
  const service = new OtpService(
    prisma as unknown as PrismaService,
    notifications as unknown as NotificationsService,
    redis as unknown as Redis,
  );
  return { service, prisma, notifications, redis };
}

function issuedCodeFrom(body: string): string {
  const match = new RegExp(`\\b\\d{${OTP_LENGTH}}\\b`).exec(body);
  if (!match) throw new Error(`no code in message: ${body}`);
  return match[0];
}

describe('OtpService.issue', () => {
  it('invalidates prior codes, stores only a hash, and sends the code by SMS', async () => {
    const { service, prisma, notifications } = build();
    await service.issue({
      userId: USER_ID,
      purpose: VerificationPurpose.PHONE_VERIFICATION,
      deliverTo: { phone: '+254712345678' },
      channel: 'sms',
    });

    expect(prisma.verificationCode.updateMany).toHaveBeenCalledWith({
      where: { userId: USER_ID, purpose: VerificationPurpose.PHONE_VERIFICATION, consumedAt: null },
      data: { consumedAt: expect.any(Date) },
    });

    const { to, body } = notifications.sendSms.mock.calls[0][0] as { to: string; body: string };
    expect(to).toBe('+254712345678');
    const code = issuedCodeFrom(body);
    expect(code).toHaveLength(OTP_LENGTH);
    expect(body).toContain('verify your phone number');
    expect(body).toContain('Never share it');

    const { data } = prisma.verificationCode.create.mock.calls[0][0] as {
      data: { codeHash: string; expiresAt: Date };
    };
    expect(data.codeHash).toBe(hashCode(code));
    expect(data.codeHash).not.toContain(code);
    const ttlMs = data.expiresAt.getTime() - Date.now();
    expect(ttlMs).toBeGreaterThan(0);
    expect(ttlMs).toBeLessThanOrEqual(OTP_TTL_SECONDS * 1000);
  });

  it('sends an email (text and html) when the channel is email', async () => {
    const { service, notifications } = build();
    await service.issue({
      userId: USER_ID,
      purpose: VerificationPurpose.PASSWORD_RESET,
      deliverTo: { email: 'asha@example.com' },
      channel: 'email',
    });
    expect(notifications.sendSms).not.toHaveBeenCalled();
    const email = notifications.sendEmail.mock.calls[0][0] as {
      to: string;
      subject: string;
      text: string;
      html: string;
    };
    expect(email.to).toBe('asha@example.com');
    expect(email.subject).toBe('Your Suluhu verification code');
    expect(email.text).toContain('reset your password');
    expect(email.html).toContain(issuedCodeFrom(email.text));
  });

  it('still records the code but warns when the channel has no target', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const { service, prisma, notifications } = build();
    await service.issue({
      userId: USER_ID,
      purpose: VerificationPurpose.MFA_CHALLENGE,
      deliverTo: {},
      channel: 'sms',
    });
    expect(notifications.sendSms).not.toHaveBeenCalled();
    expect(notifications.sendEmail).not.toHaveBeenCalled();
    expect(prisma.verificationCode.create).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('MFA_CHALLENGE'));
    warn.mockRestore();
  });

  it('sets the throttle window expiry only on the first request', async () => {
    const { service, redis } = build();
    await service.issue({
      userId: USER_ID,
      purpose: VerificationPurpose.PHONE_VERIFICATION,
      deliverTo: { phone: '+254712345678' },
      channel: 'sms',
    });
    expect(redis.incr).toHaveBeenCalledWith(
      `auth:otp:throttle:${USER_ID}:${VerificationPurpose.PHONE_VERIFICATION}`,
    );
    expect(redis.expire).toHaveBeenCalledWith(expect.any(String), 15 * 60);

    const second = build({ requestCount: 2 });
    await second.service.issue({
      userId: USER_ID,
      purpose: VerificationPurpose.PHONE_VERIFICATION,
      deliverTo: { phone: '+254712345678' },
      channel: 'sms',
    });
    expect(second.redis.expire).not.toHaveBeenCalled();
  });

  it('rate-limits issuance beyond three requests per window', async () => {
    const { service, prisma, notifications } = build({ requestCount: 4 });
    await expect(
      service.issue({
        userId: USER_ID,
        purpose: VerificationPurpose.PHONE_VERIFICATION,
        deliverTo: { phone: '+254712345678' },
        channel: 'sms',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.RATE_LIMITED });
    expect(prisma.verificationCode.create).not.toHaveBeenCalled();
    expect(notifications.sendSms).not.toHaveBeenCalled();
  });
});

describe('OtpService.verify', () => {
  const baseRecord = {
    id: 'vc1',
    attempts: 0,
    consumedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    codeHash: hashCode('123456'),
  };

  it('consumes the newest unconsumed code on a correct submission', async () => {
    const { service, prisma } = build({ record: baseRecord });
    await service.verify(USER_ID, VerificationPurpose.MFA_CHALLENGE, '123456');
    expect(prisma.verificationCode.findFirst).toHaveBeenCalledWith({
      where: { userId: USER_ID, purpose: VerificationPurpose.MFA_CHALLENGE, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    expect(prisma.verificationCode.update).toHaveBeenCalledWith({
      where: { id: 'vc1' },
      data: { consumedAt: expect.any(Date) },
    });
  });

  it('rejects when there is no active code', async () => {
    const { service } = build();
    await expect(
      service.verify(USER_ID, VerificationPurpose.MFA_CHALLENGE, '123456'),
    ).rejects.toMatchObject({
      code: ErrorCode.AUTH_OTP_INVALID,
      message: 'No active code. Request a new one.',
    });
  });

  it('rejects an expired code without consuming it', async () => {
    const { service, prisma } = build({
      record: { ...baseRecord, expiresAt: new Date(Date.now() - 1000) },
    });
    await expect(
      service.verify(USER_ID, VerificationPurpose.MFA_CHALLENGE, '123456'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_OTP_EXPIRED });
    expect(prisma.verificationCode.update).not.toHaveBeenCalled();
  });

  it('increments the attempt counter on an incorrect code', async () => {
    const { service, prisma } = build({ record: baseRecord });
    await expect(
      service.verify(USER_ID, VerificationPurpose.MFA_CHALLENGE, '999999'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_OTP_INVALID, message: 'Incorrect code.' });
    expect(prisma.verificationCode.update).toHaveBeenCalledWith({
      where: { id: 'vc1' },
      data: { attempts: { increment: 1 } },
    });
  });

  it('burns the code once the attempt limit is reached', async () => {
    const { service, prisma } = build({
      record: { ...baseRecord, attempts: OTP_MAX_ATTEMPTS },
    });
    await expect(
      service.verify(USER_ID, VerificationPurpose.MFA_CHALLENGE, '123456'),
    ).rejects.toMatchObject({ message: 'Too many attempts. Request a new code.' });
    expect(prisma.verificationCode.update).toHaveBeenCalledWith({
      where: { id: 'vc1' },
      data: { consumedAt: expect.any(Date) },
    });
  });

  it('accepts a code that was just issued end-to-end', async () => {
    const { service, prisma, notifications } = build();
    await service.issue({
      userId: USER_ID,
      purpose: VerificationPurpose.EMAIL_VERIFICATION,
      deliverTo: { email: 'asha@example.com' },
      channel: 'email',
    });
    const { text } = notifications.sendEmail.mock.calls[0][0] as { text: string };
    const { data } = prisma.verificationCode.create.mock.calls[0][0] as {
      data: { codeHash: string };
    };
    prisma.verificationCode.findFirst.mockResolvedValue({ ...baseRecord, codeHash: data.codeHash });

    await expect(
      service.verify(USER_ID, VerificationPurpose.EMAIL_VERIFICATION, issuedCodeFrom(text)),
    ).resolves.toBeUndefined();
  });
});
