import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Providers } from '@/components/providers';
import { PwaRegister } from '@/components/pwa-register';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Suluhu Therapy Center',
    template: '%s · Suluhu Therapy Center',
  },
  description:
    'Compliant online mental health platform connecting the Rift Valley to CPB-licensed therapists. Secure video therapy in English and Swahili.',
  applicationName: 'Suluhu Therapy Center',
  metadataBase: new URL('https://suluhu.co.ke'),
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Suluhu', statusBarStyle: 'default' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#1b4f8c',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Canonical Suluhu type stack: Manrope (display) + Inter (UI/body). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
