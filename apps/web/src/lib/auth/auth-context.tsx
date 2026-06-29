'use client';

import type { AuthTokens, AuthUser, UserRole } from '@suluhu/shared';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from './auth-api';
import { tokenStore } from './token-store';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  setSession: (user: AuthUser, tokens: AuthTokens) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Maps a role to its home dashboard route. */
export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case 'THERAPIST':
      return '/therapist';
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return '/admin';
    default:
      return '/patient';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const setSession = useCallback((nextUser: AuthUser, tokens: AuthTokens) => {
    tokenStore.set(tokens);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    tokenStore.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus('authenticated');
    } catch {
      // Access token likely expired — attempt a silent refresh.
      const refreshed = await authApi.refresh();
      if (refreshed) {
        tokenStore.set(refreshed.tokens);
        setUser(refreshed.user);
        setStatus('authenticated');
      } else {
        tokenStore.clear();
        setUser(null);
        setStatus('unauthenticated');
      }
    }
  }, []);

  useEffect(() => {
    if (!tokenStore.access && !tokenStore.refresh) {
      setStatus('unauthenticated');
      return;
    }
    void refreshUser();
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, setSession, refreshUser, logout }),
    [user, status, setSession, refreshUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
