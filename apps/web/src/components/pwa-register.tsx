'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker (production only — avoids stale-chunk issues in
 * Next dev). Enables the offline shell for low-connectivity areas (SDLC §11.4).
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const onLoad = () => navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
