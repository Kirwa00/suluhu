import { WifiOff } from 'lucide-react';

export const metadata = { title: 'Offline' };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-secondary">
        <WifiOff className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="font-display text-2xl font-bold text-on-surface">You’re offline</h1>
      <p className="max-w-sm text-on-surface-variant">
        Suluhu needs a connection for live sessions and bookings. Your draft entries are saved and
        will sync when you’re back online.
      </p>
      <a href="/" className="text-secondary hover:underline">
        Try again
      </a>
    </main>
  );
}
