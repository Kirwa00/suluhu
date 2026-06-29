import type { SoapNoteInput, TreatmentPlanInput } from '@suluhu/shared';
import { apiFetch } from '@/lib/api-client';
import { tokenStore } from '@/lib/auth/token-store';

export interface ClientSummary {
  id: string;
  name: string;
  lastSession: string;
  count: number;
  riskLevel: string | null;
}

export interface HealthRecord {
  patient: { id: string; name: string; county: string | null; gender: string | null };
  latestIntake: {
    phq9Score: number;
    gad7Score: number;
    cageScore: number;
    riskLevel: string;
    primaryConcern: string | null;
    completedAt: string;
  } | null;
  intakeTrend: { phq9: number; gad7: number; date: string }[];
  appointments: {
    id: string;
    scheduledAt: string;
    durationMins: number;
    status: string;
    therapistName: string;
    completed: boolean;
  }[];
  treatmentPlan: { goals: string[]; interventions: string[]; status: string } | null;
  openAlerts: { id: string; type: string; message: string; createdAt: string }[];
  notesCount: number;
}

export interface SoapNoteView {
  id: string;
  appointmentId: string | null;
  status: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  riskAssessment: string;
  finalizedAt: string | null;
  scheduledAt: string | null;
  updatedAt: string;
}

export interface SoapDraft {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  riskAssessment: string;
  nextSessionGoals: string[];
}

export interface TreatmentPlanView {
  id: string;
  goals: string[];
  interventions: string[];
  reviewDate: string | null;
  status: string;
  summary: string;
  updatedAt: string;
}

function auth() {
  return tokenStore.access ?? undefined;
}

export const clinicalApi = {
  clients() {
    return apiFetch<ClientSummary[]>('/clinical/clients', { accessToken: auth() });
  },
  healthRecord(patientId: string) {
    return apiFetch<HealthRecord>(`/patients/${patientId}/health-record`, { accessToken: auth() });
  },
  noteByAppointment(appointmentId: string) {
    return apiFetch<SoapNoteView | null>(`/clinical-notes/appointment/${appointmentId}`, {
      accessToken: auth(),
    });
  },
  patientNotes(patientId: string) {
    return apiFetch<SoapNoteView[]>(`/patients/${patientId}/notes`, { accessToken: auth() });
  },
  upsertNote(input: SoapNoteInput) {
    return apiFetch<SoapNoteView>('/clinical-notes', {
      method: 'POST',
      body: input,
      accessToken: auth(),
    });
  },
  aiDraft(appointmentId: string, therapistModality?: string) {
    return apiFetch<SoapDraft>('/clinical-notes/ai-draft', {
      method: 'POST',
      body: { appointmentId, therapistModality },
      accessToken: auth(),
    });
  },
  getPlan(patientId: string) {
    return apiFetch<TreatmentPlanView | null>(`/patients/${patientId}/treatment-plan`, {
      accessToken: auth(),
    });
  },
  upsertPlan(input: TreatmentPlanInput) {
    return apiFetch<TreatmentPlanView>('/treatment-plans', {
      method: 'POST',
      body: input,
      accessToken: auth(),
    });
  },
};
