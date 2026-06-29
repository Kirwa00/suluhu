import type { AuthTokens } from '@suluhu/shared';

/**
 * Client-side token storage. Access + refresh tokens are kept in localStorage
 * for this SPA-style client and mirrored in memory for synchronous access.
 *
 * NOTE: A future hardening step (per SDLC §7.2) moves the refresh token to an
 * HttpOnly cookie set by the API; the client code already isolates access here
 * so that change is localized.
 */
const ACCESS_KEY = 'suluhu.accessToken';
const REFRESH_KEY = 'suluhu.refreshToken';

let accessTokenMemory: string | null = null;

export const tokenStore = {
  get access(): string | null {
    if (accessTokenMemory) return accessTokenMemory;
    if (typeof window === 'undefined') return null;
    accessTokenMemory = window.localStorage.getItem(ACCESS_KEY);
    return accessTokenMemory;
  },
  get refresh(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: AuthTokens): void {
    accessTokenMemory = tokens.accessToken;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
      window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    }
  },
  clear(): void {
    accessTokenMemory = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACCESS_KEY);
      window.localStorage.removeItem(REFRESH_KEY);
    }
  },
};
