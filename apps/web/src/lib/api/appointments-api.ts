import type { CreateAppointmentInput } from '@suluhu/shared';
import { apiFetch } from '@/lib/api-client';
import { tokenStore } from '@/lib/auth/token-store';

export interface DaySlots {
  date: string;
  slots: string[];
}

export interface AppointmentView {
  id: string;
  scheduledAt: string;
  durationMins: number;
  status: string;
  priceKsh: number;
  isFreeSession: boolean;
  patientId: string;
  therapistId: string;
  patient: { name: string };
  therapist: { name: string; title: string | null };
  payment: { status: string; method: string; amountKsh: number } | null;
  cancellationReason: string | null;
}

export interface CreateAppointmentResult {
  appointment: AppointmentView;
  requiresPayment: boolean;
  checkoutRequestId?: string;
  customerMessage?: string;
}

export interface PaymentStatusView {
  paymentStatus: string;
  method: string;
  amountKsh: number;
  paidAt: string | null;
  appointmentStatus: string;
}

function auth() {
  return tokenStore.access ?? undefined;
}

export const appointmentsApi = {
  getSlots(therapistId: string, from: string, to: string, durationMins: number) {
    const qs = new URLSearchParams({ from, to, durationMins: String(durationMins) }).toString();
    return apiFetch<DaySlots[]>(`/therapists/${therapistId}/slots?${qs}`, { accessToken: auth() });
  },
  create(input: CreateAppointmentInput) {
    return apiFetch<CreateAppointmentResult>('/appointments', {
      method: 'POST',
      body: input,
      accessToken: auth(),
    });
  },
  list(scope: 'upcoming' | 'past' | 'all' = 'upcoming') {
    return apiFetch<AppointmentView[]>(`/appointments?scope=${scope}`, { accessToken: auth() });
  },
  get(id: string) {
    return apiFetch<AppointmentView>(`/appointments/${id}`, { accessToken: auth() });
  },
  cancel(id: string, reason?: string) {
    return apiFetch<AppointmentView>(`/appointments/${id}/cancel`, {
      method: 'POST',
      body: { reason },
      accessToken: auth(),
    });
  },
  paymentStatus(appointmentId: string) {
    return apiFetch<PaymentStatusView>(`/payments/appointment/${appointmentId}`, {
      accessToken: auth(),
    });
  },
};
