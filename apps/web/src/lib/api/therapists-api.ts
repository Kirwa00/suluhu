import type {
  Paginated,
  SetAvailabilityInput,
  SubmitCredentialsInput,
  TherapistSearchQuery,
} from '@suluhu/shared';
import { apiFetch } from '@/lib/api-client';
import { tokenStore } from '@/lib/auth/token-store';

export interface OnboardingStatus {
  verificationStatus: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  cpbCheck: { valid: boolean; status: string; expiry?: string } | null;
  checklist: {
    credentialsSubmitted: boolean;
    availabilitySet: boolean;
    cpbChecked: boolean;
    approved: boolean;
  };
}

export interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface TherapistCard {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  gender: string | null;
  specialties: string[];
  languages: string[];
  yearsExperience: number | null;
  sessionRateKsh: number | null;
  ratingAvg: number;
  ratingCount: number;
  bioSnippet: string | null;
  profilePhotoUrl: string | null;
}

export interface TherapistDetail extends TherapistCard {
  bio: string | null;
  sessionsCompleted: number;
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
}

function auth() {
  return tokenStore.access ?? undefined;
}

function toQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const therapistsApi = {
  submitCredentials(input: SubmitCredentialsInput) {
    return apiFetch<OnboardingStatus>('/therapists/me/credentials', {
      method: 'POST',
      body: input,
      accessToken: auth(),
    });
  },
  getOnboarding() {
    return apiFetch<OnboardingStatus>('/therapists/me/onboarding', { accessToken: auth() });
  },
  getAvailability() {
    return apiFetch<AvailabilitySlot[]>('/therapists/me/availability', { accessToken: auth() });
  },
  setAvailability(input: SetAvailabilityInput) {
    return apiFetch<{ slots: number }>('/therapists/me/availability', {
      method: 'PUT',
      body: input,
      accessToken: auth(),
    });
  },
  search(query: Partial<TherapistSearchQuery>) {
    return apiFetch<Paginated<TherapistCard>>(`/therapists${toQuery(query)}`, {
      accessToken: auth(),
    });
  },
  getDetail(id: string) {
    return apiFetch<TherapistDetail>(`/therapists/${id}`, { accessToken: auth() });
  },
};
