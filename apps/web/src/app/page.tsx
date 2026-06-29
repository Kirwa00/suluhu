import Link from 'next/link';
import { ShieldCheck, BadgeCheck, HeartHandshake, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDictionary } from '@/i18n/dictionaries';

/**
 * Landing page. Static, calm, and accessible — the public entry point before
 * authentication (M1 adds the auth flows behind the CTAs).
 */
export default function HomePage() {
  const t = getDictionary('en');

  const features = [
    {
      icon: ShieldCheck,
      title: t['landing.feature.secure.title'],
      body: t['landing.feature.secure.body'],
    },
    {
      icon: BadgeCheck,
      title: t['landing.feature.licensed.title'],
      body: t['landing.feature.licensed.body'],
    },
    {
      icon: HeartHandshake,
      title: t['landing.feature.access.title'],
      body: t['landing.feature.access.body'],
    },
  ];

  return (
    <main className="min-h-screen bg-surface">
      {/* Crisis banner — always reachable (SDLC §12.1) */}
      <div className="bg-primary text-on-primary">
        <div className="container flex items-center justify-center gap-2 py-2 text-center text-sm">
          <Phone className="h-4 w-4" aria-hidden />
          <span>{t['landing.crisis']}</span>
        </div>
      </div>

      <header className="container flex items-center justify-between py-6">
        <span className="font-display text-xl font-bold text-primary">{t['brand.name']}</span>
        <nav className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">{t['landing.cta.start']}</Link>
          </Button>
        </nav>
      </header>

      <section className="container grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col gap-6">
          <h1 className="font-display text-4xl font-bold leading-tight text-on-surface lg:text-5xl">
            {t['landing.heading']}
          </h1>
          <p className="max-w-xl text-lg text-on-surface-variant">{t['landing.subheading']}</p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/register">{t['landing.cta.start']}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/register?role=therapist">{t['landing.cta.therapist']}</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-soothing p-8 shadow-ambient">
          <p className="font-display text-2xl font-semibold text-tertiary">{t['brand.tagline']}</p>
        </div>
      </section>

      <section className="container grid gap-6 pb-24 md:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 transition-shadow hover:shadow-ambient"
          >
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-accent text-secondary">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="mb-2 font-display text-lg font-semibold text-on-surface">{title}</h2>
            <p className="text-on-surface-variant">{body}</p>
          </article>
        ))}
      </section>

      <footer className="border-t border-outline-variant bg-surface-container-lowest">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-sm text-on-surface-variant sm:flex-row">
          <span>© {new Date().getFullYear()} {t['brand.name']} · Eldoret, Kenya</span>
          <span>Kenya Data Protection Act 2019 compliant</span>
        </div>
      </footer>
    </main>
  );
}
