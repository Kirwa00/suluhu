import { UserRole, UserStatus } from '@suluhu/shared';
import type { User } from '@prisma/client';
import { AuthService } from './auth.service';

const IDENTITY = { sub: 'g-123', email: 'asha@example.com', firstName: 'Asha', lastName: 'W' };
const CTX = { ipAddress: '1.1.1.1', userAgent: 'jest' };

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'asha@example.com',
    phone: '+254712345678',
    passwordHash: 'hash',
    googleSub: null,
    role: UserRole.PATIENT,
    status: UserStatus.ACTIVE,
    firstName: 'Asha',
    lastName: 'W',
    locale: 'en',
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    mfaEnabled: false,
    lastLoginAt: null,
    failedLogins: 0,
    lockedUntil: null,
    acceptedTermsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as User;
}

function setup(found: { bySub?: User | null; byEmail?: User | null } = {}) {
  const prisma = {
    user: {
      findFirst: jest
        .fn()
        .mockResolvedValueOnce(found.bySub ?? null)
        .mockResolvedValueOnce(found.byEmail ?? null),
      update: jest.fn().mockImplementation(({ data }) => ({ ...found.byEmail, ...data })),
      create: jest.fn().mockImplementation(({ data }) => makeUser(data)),
    },
  };
  const tokens = {
    issueTokens: jest
      .fn()
      .mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresIn: 900 }),
    signMfaChallenge: jest.fn().mockResolvedValue('mfa-token'),
  };
  const otp = { issue: jest.fn() };
  const audit = { record: jest.fn() };
  const passwords = { hash: jest.fn().mockResolvedValue('random-hash') };
  const google = { verify: jest.fn().mockResolvedValue(IDENTITY) };
  const service = new AuthService(
    prisma as never,
    passwords as never,
    tokens as never,
    otp as never,
    audit as never,
    google as never,
  );
  return { service, prisma, tokens, google, audit };
}

describe('AuthService Google sign-in', () => {
  it('signs in a user already linked to the Google account', async () => {
    const { service, prisma } = setup({ bySub: makeUser({ googleSub: 'g-123' }) });
    const result = await service.loginWithGoogle('cred', CTX);
    expect(result.status).toBe('AUTHENTICATED');
    expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
  });

  it('links an existing account with the same email, then signs in', async () => {
    const { service, prisma, audit } = setup({ byEmail: makeUser() });
    const result = await service.loginWithGoogle('cred', CTX);
    expect(result.status).toBe('AUTHENTICATED');
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u1' },
        data: expect.objectContaining({ googleSub: 'g-123', emailVerifiedAt: expect.any(Date) }),
      }),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'auth.google.link' }),
    );
  });

  it('refuses an email already linked to a different Google account', async () => {
    const { service } = setup({ byEmail: makeUser({ googleSub: 'other' }) });
    await expect(service.loginWithGoogle('cred', CTX)).rejects.toThrow('different Google account');
  });

  it('keeps the SMS step for MFA roles', async () => {
    const therapist = makeUser({ googleSub: 'g-123', role: UserRole.THERAPIST, mfaEnabled: true });
    const { service, tokens } = setup({ bySub: therapist });
    await expect(service.loginWithGoogle('cred', CTX)).resolves.toEqual({
      status: 'MFA_REQUIRED',
      mfaToken: 'mfa-token',
    });
    expect(tokens.issueTokens).not.toHaveBeenCalled();
  });

  it('blocks suspended accounts', async () => {
    const { service } = setup({
      bySub: makeUser({ googleSub: 'g-123', status: UserStatus.SUSPENDED }),
    });
    await expect(service.loginWithGoogle('cred', CTX)).rejects.toThrow('not active');
  });

  it('asks unknown emails to sign up', async () => {
    const { service } = setup();
    await expect(service.loginWithGoogle('cred', CTX)).resolves.toEqual({
      status: 'SIGNUP_REQUIRED',
      profile: { email: 'asha@example.com', firstName: 'Asha', lastName: 'W' },
    });
  });

  it('registers with the Google email and links the Google account', async () => {
    const { service, prisma, google } = setup();
    const result = await service.registerWithGoogle(
      {
        credential: 'cred',
        firstName: 'Asha',
        lastName: 'W',
        phone: '+254712345678',
        role: UserRole.PATIENT,
        locale: 'en',
        acceptedTerms: true,
      },
      CTX,
    );
    expect(google.verify).toHaveBeenCalledWith('cred');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'asha@example.com',
        googleSub: 'g-123',
        emailVerifiedAt: expect.any(Date),
        passwordHash: 'random-hash',
      }),
    });
    expect(result.user.email).toBe('asha@example.com');
  });
});
