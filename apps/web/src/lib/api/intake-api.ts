import type { SubmitIntakeInput } from '@suluhu/shared';
import { apiFetch } from '@/lib/api-client';
import { tokenStore } from '@/lib/auth/token-store';

export interface TherapistMatch {
  id: string;
  name: string;
  title: string | null;
  specialties: string[];
  sessionRateKsh: number | null;
  ratingAvg: number;
}

export interface IntakeResult {
  assessmentId: string;
  phq9Score: number;
  gad7Score: number;
  cageScore: number;
  riskLevel: string;
  crisisFlag: boolean;
  recommendedSpecialties: string[];
  aiSummary: string | null;
  crisisResources: { hotline: string; message: string } | null;
  matches: TherapistMatch[];
}

export interface LatestIntake {
  assessment: {
    id: string;
    phq9Score: number;
    gad7Score: number;
    cageScore: number;
    riskLevel: string;
    crisisFlag: boolean;
    recommendedSpecialties: string[];
    aiSummary: string | null;
    completedAt: string;
  } | null;
  matches: TherapistMatch[];
}

function auth() {
  return tokenStore.access ?? undefined;
}

export const intakeApi = {
  submit(input: SubmitIntakeInput) {
    return apiFetch<IntakeResult>('/intake/assessments', {
      method: 'POST',
      body: input,
      accessToken: auth(),
    });
  },
  latest() {
    return apiFetch<LatestIntake>('/intake/me', { accessToken: auth() });
  },
};
