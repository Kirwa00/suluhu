'use client';

import { Languages } from 'lucide-react';
import { useLocale } from '@/i18n/locale-context';
import { cn } from '@/lib/utils';

/** Compact EN/SW toggle (SDLC §11.4). */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full border border-outline-variant p-0.5', className)}>
      <Languages className="ml-1.5 h-3.5 w-3.5 text-on-surface-variant" aria-hidden />
      {(['en', 'sw'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium uppercase transition-colors',
            locale === l ? 'bg-accent text-primary' : 'text-on-surface-variant hover:bg-surface-container',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
