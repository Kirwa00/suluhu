'use client';

import { useEffect, useRef } from 'react';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

interface GoogleAccountsId {
  initialize(options: { client_id: string; callback: (r: { credential: string }) => void }): void;
  renderButton(el: HTMLElement, options: Record<string, unknown>): void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let gsiLoader: Promise<void> | null = null;
function loadGsi(): Promise<void> {
  gsiLoader ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gsiLoader = null;
      reject(new Error('Failed to load Google sign-in'));
    };
    document.head.appendChild(script);
  });
  return gsiLoader;
}

/** Renders Google's "Sign in with Google" button; hidden when no client ID is configured. */
export function GoogleSignInButton({
  onCredential,
  text = 'continue_with',
}: {
  onCredential: (credential: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  callback.current = onCredential;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        const gsi = window.google?.accounts.id;
        if (cancelled || !gsi || !ref.current) return;
        gsi.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: ({ credential }) => callback.current(credential),
        });
        gsi.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          text,
          width: ref.current.offsetWidth || 320,
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!GOOGLE_CLIENT_ID) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
        <span className="h-px flex-1 bg-outline-variant" />
        or
        <span className="h-px flex-1 bg-outline-variant" />
      </div>
      <div ref={ref} className="flex w-full justify-center" />
    </div>
  );
}
