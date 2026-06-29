import Link from 'next/link';
import { Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { BEFRIENDERS_KENYA_HOTLINE } from '@suluhu/shared';

/** Calm, centered shell for all authentication screens. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="container flex items-center justify-between py-6">
        <Link href="/" className="font-display text-xl font-bold text-primary">
          Suluhu Therapy Center
        </Link>
        <a
          href={`tel:${BEFRIENDERS_KENYA_HOTLINE}`}
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Crisis line: 0800 723 253
        </a>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="container py-6 text-center text-xs text-on-surface-variant">
        © {new Date().getFullYear()} Suluhu Therapy Center · Eldoret, Kenya · DPA 2019 compliant
      </footer>
    </div>
  );
}
