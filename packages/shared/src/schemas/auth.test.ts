import { describe, expect, it } from 'vitest';
import { UserRole, VerificationPurpose } from '../enums';
import {
  changePasswordSchema,
  loginSchema,
  otpCodeSchema,
  refreshTokenSchema,
  registerSchema,
  registrableRoleSchema,
  requestOtpSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyMfaSchema,
  verifyOtpSchema,
} from './auth';

const VALID_REGISTRATION = {
  firstName: '  Faith ',
  lastName: 'Cheruiyot',
  email: 'Faith@Example.com',
  phone: '0712345678',
  password: 'Suluhu2026',
  acceptedTerms: true as const,
};

describe('registerSchema', () => {
  it('normalizes contact details and defaults role and locale', () => {
    expect(registerSchema.parse(VALID_REGISTRATION)).toEqual({
      firstName: 'Faith',
      lastName: 'Cheruiyot',
      email: 'faith@example.com',
      phone: '+254712345678',
      password: 'Suluhu2026',
      role: UserRole.PATIENT,
      locale: 'en',
      acceptedTerms: true,
    });
  });

  it('accepts a therapist self-registration', () => {
    const parsed = registerSchema.parse({ ...VALID_REGISTRATION, role: UserRole.THERAPIST });
    expect(parsed.role).toBe(UserRole.THERAPIST);
  });

  it('rejects self-registration as an admin', () => {
    expect(registerSchema.safeParse({ ...VALID_REGISTRATION, role: UserRole.ADMIN }).success).toBe(
      false,
    );
    expect(registrableRoleSchema.safeParse(UserRole.SUPER_ADMIN).success).toBe(false);
  });

  it('requires the terms to be accepted', () => {
    const result = registerSchema.safeParse({ ...VALID_REGISTRATION, acceptedTerms: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('You must accept the terms and privacy policy');
    }
  });

  it.each([
    [{ firstName: '   ' }, 'blank first name'],
    [{ lastName: '' }, 'blank last name'],
    [{ password: 'weak' }, 'weak password'],
    [{ phone: '0812345678' }, 'invalid phone'],
  ])('rejects %o (%s)', (overrides) => {
    expect(registerSchema.safeParse({ ...VALID_REGISTRATION, ...overrides }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('normalizes the email and keeps the password verbatim', () => {
    expect(loginSchema.parse({ email: ' Faith@Example.com ', password: ' spaced ' })).toEqual({
      email: 'faith@example.com',
      password: ' spaced ',
    });
  });

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'faith@example.com', password: '' }).success).toBe(false);
  });
});

describe('otpCodeSchema', () => {
  it('accepts a trimmed six-digit code', () => {
    expect(otpCodeSchema.parse(' 012345 ')).toBe('012345');
  });

  it.each([['12345'], ['1234567'], ['12a456'], ['']])('rejects %s', (code) => {
    expect(otpCodeSchema.safeParse(code).success).toBe(false);
  });
});

describe('OTP request/verify schemas', () => {
  it('accepts every verification purpose', () => {
    for (const purpose of Object.values(VerificationPurpose)) {
      expect(requestOtpSchema.parse({ purpose }).purpose).toBe(purpose);
    }
  });

  it('rejects an unknown purpose', () => {
    expect(requestOtpSchema.safeParse({ purpose: 'PASSPORT_CHECK' }).success).toBe(false);
  });

  it('requires purpose and code together when verifying', () => {
    expect(
      verifyOtpSchema.parse({ purpose: VerificationPurpose.MFA_CHALLENGE, code: '123456' }),
    ).toEqual({ purpose: VerificationPurpose.MFA_CHALLENGE, code: '123456' });
    expect(verifyOtpSchema.safeParse({ code: '123456' }).success).toBe(false);
  });
});

describe('verifyMfaSchema', () => {
  it('requires the MFA session token', () => {
    expect(verifyMfaSchema.safeParse({ mfaToken: '', code: '123456' }).success).toBe(false);
    expect(verifyMfaSchema.parse({ mfaToken: 'tok', code: '123456' }).mfaToken).toBe('tok');
  });
});

describe('refreshTokenSchema', () => {
  it('allows the token to be omitted (cookie-based refresh)', () => {
    expect(refreshTokenSchema.parse({})).toEqual({});
  });

  it('rejects an empty string token', () => {
    expect(refreshTokenSchema.safeParse({ refreshToken: '' }).success).toBe(false);
  });
});

describe('password reset schemas', () => {
  it('normalizes the email when requesting a reset', () => {
    expect(requestPasswordResetSchema.parse({ email: ' Faith@Example.com ' })).toEqual({
      email: 'faith@example.com',
    });
  });

  it('enforces the password policy on reset', () => {
    expect(
      resetPasswordSchema.safeParse({
        email: 'faith@example.com',
        code: '123456',
        password: 'weak',
      }).success,
    ).toBe(false);
    expect(
      resetPasswordSchema.parse({
        email: 'faith@example.com',
        code: '123456',
        password: 'Suluhu2026',
      }).password,
    ).toBe('Suluhu2026');
  });
});

describe('changePasswordSchema', () => {
  it('accepts a different new password', () => {
    expect(
      changePasswordSchema.parse({ currentPassword: 'Old12345', newPassword: 'Suluhu2026' })
        .newPassword,
    ).toBe('Suluhu2026');
  });

  it('rejects reusing the current password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'Suluhu2026',
      newPassword: 'Suluhu2026',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['newPassword']);
      expect(result.error.issues[0]?.message).toBe('New password must differ from the current one');
    }
  });

  it('requires the current password', () => {
    expect(
      changePasswordSchema.safeParse({ currentPassword: '', newPassword: 'Suluhu2026' }).success,
    ).toBe(false);
  });
});
