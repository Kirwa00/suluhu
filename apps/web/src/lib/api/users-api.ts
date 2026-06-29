import type { UpdateProfileInput } from '@suluhu/shared';
import { apiFetch } from '@/lib/api-client';
import { tokenStore } from '@/lib/auth/token-store';

export interface ProfileView {
  id: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  firstName: string;
  lastName: string;
  locale: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  patient?: { county: string | null; gender: string | null; freeSessionsUsed: number };
  therapist?: {
    cpbLicenseNumber: string | null;
    verificationStatus: string;
    specialties: string[];
    languages: string[];
    sessionRateKsh: number | null;
    bio: string | null;
  };
}

export const usersApi = {
  getProfile() {
    return apiFetch<ProfileView>('/users/me', { accessToken: tokenStore.access ?? undefined });
  },
  updateProfile(input: UpdateProfileInput) {
    return apiFetch<ProfileView>('/users/me', {
      method: 'PATCH',
      body: input,
      accessToken: tokenStore.access ?? undefined,
    });
  },
  changePassword(currentPassword: string, newPassword: string) {
    return apiFetch<{ changed: boolean }>('/auth/password/change', {
      method: 'POST',
      body: { currentPassword, newPassword },
      accessToken: tokenStore.access ?? undefined,
    });
  },
};
