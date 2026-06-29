import { z } from 'zod';
import { UserRole, VerificationPurpose } from '../enums';
import { emailSchema, kenyanPhoneSchema, localeSchema, passwordSchema } from './common';

/** Self-registration is limited to patients and therapists (admins are provisioned). */
export const registrableRoleSchema = z.enum([UserRole.PATIENT, UserRole.THERAPIST]);

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: emailSchema,
  phone: kenyanPhoneSchema,
  password: passwordSchema,
  role: registrableRoleSchema.default(UserRole.PATIENT),
  locale: localeSchema,
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and privacy policy' }),
  }),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Enter the 6-digit code');

export const requestOtpSchema = z.object({
  purpose: z.nativeEnum(VerificationPurpose),
});
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  purpose: z.nativeEnum(VerificationPurpose),
  code: otpCodeSchema,
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

/** MFA challenge issued during login for therapist/admin accounts. */
export const verifyMfaSchema = z.object({
  mfaToken: z.string().min(1, 'Missing MFA session token'),
  code: otpCodeSchema,
});
export type VerifyMfaInput = z.infer<typeof verifyMfaSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const requestPasswordResetSchema = z.object({ email: emailSchema });
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const resetPasswordSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'New password must differ from the current one',
    path: ['newPassword'],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/** Authenticated principal embedded in the access token. */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: string;
  mfaEnabled: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export type LoginResult =
  | { status: 'AUTHENTICATED'; user: AuthUser; tokens: AuthTokens }
  | { status: 'MFA_REQUIRED'; mfaToken: string };
