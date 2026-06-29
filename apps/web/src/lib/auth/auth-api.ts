import type {
  AuthTokens,
  AuthUser,
  LoginInput,
  LoginResult,
  RegisterInput,
  VerificationPurpose,
} from '@suluhu/shared';
import { apiFetch, ApiClientError } from '@/lib/api-client';
import { tokenStore } from './token-store';

type LoginAuthenticated = Extract<LoginResult, { status: 'AUTHENTICATED' }>;

export const authApi = {
  register(input: RegisterInput) {
    return apiFetch<{ user: AuthUser; tokens: AuthTokens }>('/auth/register', {
      method: 'POST',
      body: input,
    });
  },

  login(input: LoginInput) {
    return apiFetch<LoginResult>('/auth/login', { method: 'POST', body: input });
  },

  verifyMfa(mfaToken: string, code: string) {
    return apiFetch<LoginAuthenticated>('/auth/mfa/verify', {
      method: 'POST',
      body: { mfaToken, code },
    });
  },

  me() {
    return apiFetch<AuthUser>('/auth/me', { accessToken: tokenStore.access ?? undefined });
  },

  requestOtp(purpose: VerificationPurpose) {
    return apiFetch<{ sent: boolean }>('/auth/otp/request', {
      method: 'POST',
      body: { purpose },
      accessToken: tokenStore.access ?? undefined,
    });
  },

  verifyOtp(purpose: VerificationPurpose, code: string) {
    return apiFetch<{ user: AuthUser }>('/auth/otp/verify', {
      method: 'POST',
      body: { purpose, code },
      accessToken: tokenStore.access ?? undefined,
    });
  },

  forgotPassword(email: string) {
    return apiFetch<{ sent: boolean }>('/auth/password/forgot', {
      method: 'POST',
      body: { email },
    });
  },

  resetPassword(email: string, code: string, password: string) {
    return apiFetch<{ reset: boolean }>('/auth/password/reset', {
      method: 'POST',
      body: { email, code, password },
    });
  },

  async refresh(): Promise<{ user: AuthUser; tokens: AuthTokens } | null> {
    const refreshToken = tokenStore.refresh;
    if (!refreshToken) return null;
    try {
      return await apiFetch<{ user: AuthUser; tokens: AuthTokens }>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      });
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStore.refresh ?? undefined;
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: { refreshToken },
        accessToken: tokenStore.access ?? undefined,
      });
    } catch {
      // Best-effort; clear local state regardless.
    }
  },
};

export { ApiClientError };
