'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut, Menu, Phone } from 'lucide-react';
import { BEFRIENDERS_KENYA_HOTLINE } from '@suluhu/shared';
import { useAuth, dashboardPathForRole } from '@/lib/auth/auth-context';
import { useT } from '@/i18n/locale-context';
import { navForRole } from './nav-config';
import { LanguageSwitcher } from './language-switcher';
import { cn } from '@/lib/utils';
import type { MessageKey } from '@/i18n/dictionaries';

/**
 * Authenticated layout shell: route guard, role-based sidebar, top bar with the
 * crisis line and account menu. Redirects unauthenticated users to /login.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, status, logout } = useAuth();
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status !== 'authenticated' || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-container/30 border-t-primary" />
      </div>
    );
  }

  const nav = navForRole(user.role);
  const initials = `${user.email[0] ?? 'U'}`.toUpperCase();

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest md:flex">
        <div className="flex h-16 items-center px-6">
          <Link href={dashboardPathForRole(user.role)} className="font-display text-lg font-bold text-primary">
            Suluhu
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            const className = cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-accent text-primary'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              item.soon && 'cursor-not-allowed opacity-60 hover:bg-transparent',
            );
            const content = (
              <>
                <Icon className="h-5 w-5" aria-hidden />
                <span className="flex-1">{t(item.labelKey)}</span>
                {item.soon && (
                  <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] uppercase tracking-wide text-on-surface-variant">
                    {t('common.soon')}
                  </span>
                )}
              </>
            );
            return item.soon ? (
              <span key={item.href} className={className} aria-disabled>
                {content}
              </span>
            ) : (
              <Link key={item.href} href={item.href} className={className}>
                {content}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-outline-variant p-4">
          <a
            href={`tel:${BEFRIENDERS_KENYA_HOTLINE}`}
            className="flex items-center gap-2 rounded-md bg-error-container/60 px-3 py-2 text-sm text-on-error-container"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {t('common.crisisLine')}
          </a>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 md:px-8">
          <div className="flex items-center gap-3">
            <Menu className="h-5 w-5 text-on-surface-variant md:hidden" aria-hidden />
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-secondary">
              {t(`role.${user.role}` as MessageKey)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-on-primary">
                {initials}
              </span>
              <span className="hidden text-sm text-on-surface sm:inline">{user.email}</span>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">{t('common.signOut')}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
