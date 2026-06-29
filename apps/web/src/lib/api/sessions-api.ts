import { apiFetch } from '@/lib/api-client';
import { tokenStore } from '@/lib/auth/token-store';

export type SessionPhase =
  | 'UNPAID'
  | 'EARLY'
  | 'WAITING'
  | 'READY'
  | 'IN_SESSION'
  | 'ENDED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface SessionAccess {
  appointmentId: string;
  scheduledAt: string;
  durationMins: number;
  status: string;
  phase: SessionPhase;
  isOwner: boolean;
  counterpartName: string;
  canJoin: boolean;
  roomUrl?: string;
  token?: string;
  startsInMinutes?: number;
}

function auth() {
  return tokenStore.access ?? undefined;
}

export const sessionsApi = {
  access(appointmentId: string) {
    return apiFetch<SessionAccess>(`/appointments/${appointmentId}/session`, {
      accessToken: auth(),
    });
  },
  start(appointmentId: string) {
    return apiFetch<SessionAccess>(`/appointments/${appointmentId}/session/start`, {
      method: 'POST',
      accessToken: auth(),
    });
  },
  end(appointmentId: string) {
    return apiFetch<SessionAccess>(`/appointments/${appointmentId}/session/end`, {
      method: 'POST',
      accessToken: auth(),
    });
  },
};
