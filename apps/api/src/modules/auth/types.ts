import type { AuthUser } from '@suluhu/shared';
import type { Request } from 'express';

/** JWT access-token payload. */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: AuthUser['role'];
  status: string;
  mfaEnabled: boolean;
  jti: string;
}

/** Short-lived token issued between password check and MFA verification. */
export interface MfaChallengePayload {
  sub: string;
  purpose: 'mfa';
  jti: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
  /** jti of the presented access token (set by JwtAuthGuard, used on logout). */
  authJti?: string;
  requestId?: string;
}

export interface RequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}
