/**
 * Standard API response envelope (SDLC §9.1).
 *
 *   { success, data, meta: { timestamp, version }, error }
 */

export const API_VERSION = 'v1';

export interface ApiMeta {
  timestamp: string;
  version: string;
  /** Correlation id echoed from the request for tracing. */
  requestId?: string;
}

export interface ApiError {
  /** Stable machine-readable code, e.g. `AUTH_INVALID_CREDENTIALS`. */
  code: string;
  /** Human-readable, non-technical message safe to show end users. */
  message: string;
  /** Field-level validation issues, keyed by dotted field path. */
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  meta: ApiMeta;
  error: ApiError | null;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

/** Canonical machine-readable error codes used across the API. */
export const ErrorCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL: 'INTERNAL',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_MFA_REQUIRED: 'AUTH_MFA_REQUIRED',
  AUTH_OTP_INVALID: 'AUTH_OTP_INVALID',
  AUTH_OTP_EXPIRED: 'AUTH_OTP_EXPIRED',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_EMAIL_TAKEN: 'AUTH_EMAIL_TAKEN',
  AUTH_PHONE_TAKEN: 'AUTH_PHONE_TAKEN',
  ACCOUNT_NOT_VERIFIED: 'ACCOUNT_NOT_VERIFIED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
