import type { GoogleProfile } from '@suluhu/shared';

const KEY = 'suluhu.googleSignup';

export interface PendingGoogleSignup {
  credential: string;
  profile: GoogleProfile;
}

/** Hands a verified-but-unregistered Google identity from /login to /register. */
export const pendingGoogleSignup = {
  save(value: PendingGoogleSignup) {
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
  },
  read(): PendingGoogleSignup | null {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingGoogleSignup) : null;
  },
  clear() {
    window.sessionStorage.removeItem(KEY);
  },
};
