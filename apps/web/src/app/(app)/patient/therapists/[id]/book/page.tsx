'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { SESSION_DURATIONS_MINS, FREE_SESSION_DURATION_MINS } from '@suluhu/shared';
import { ArrowLeft, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiClientError } from '@/lib/api-client';
import { appointmentsApi } from '@/lib/api/appointments-api';
import { therapistsApi } from '@/lib/api/therapists-api';
import { addDaysISO, formatKsh, formatTimeEAT, todayEAT } from '@/lib/format';

type Step = 'select' | 'paying' | 'done';

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const today = todayEAT();

  const [duration, setDuration] = useState<number>(60);
  const [date, setDate] = useState<string>(today);
  const [slot, setSlot] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<Step>('select');
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: therapist } = useQuery({
    queryKey: ['therapist', id],
    queryFn: () => therapistsApi.getDetail(id),
    enabled: Boolean(id),
  });

  const { data: days, isFetching: loadingSlots } = useQuery({
    queryKey: ['slots', id, date, duration],
    queryFn: () => appointmentsApi.getSlots(id, date, date, duration),
    enabled: Boolean(id) && step === 'select',
  });
  const slots = useMemo(() => days?.find((d) => d.date === date)?.slots ?? [], [days, date]);

  const create = useMutation({
    mutationFn: () =>
      appointmentsApi.create({
        therapistId: id,
        scheduledAt: slot as string,
        durationMins: duration,
        payerPhone: phone || undefined,
      }),
    onSuccess: (res) => {
      setAppointmentId(res.appointment.id);
      setStep(res.requiresPayment ? 'paying' : 'done');
    },
    onError: (err) =>
      setError(err instanceof ApiClientError ? err.message : 'Could not book. Try again.'),
  });

  // Poll payment status while the (mock) STK push settles.
  const { data: payStatus } = useQuery({
    queryKey: ['payment', appointmentId],
    queryFn: () => appointmentsApi.paymentStatus(appointmentId as string),
    enabled: step === 'paying' && Boolean(appointmentId),
    refetchInterval: (q) =>
      q.state.data?.appointmentStatus === 'SCHEDULED' ? false : 2000,
  });
  useEffect(() => {
    if (step === 'paying' && payStatus?.appointmentStatus === 'SCHEDULED') {
      setStep('done');
    }
  }, [step, payStatus?.appointmentStatus]);

  const isFreeEligible = duration === FREE_SESSION_DURATION_MINS;

  return (
    <div className="max-w-3xl">
      <Link
        href={`/patient/therapists/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to profile
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-on-surface">
        Book a session{therapist ? ` with ${therapist.firstName} ${therapist.lastName}` : ''}
      </h1>

      {step === 'done' ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-success-calm" aria-hidden />
            <div>
              <p className="font-display text-xl font-semibold text-on-surface">
                Your session is confirmed
              </p>
              <p className="text-on-surface-variant">
                We’ve sent a confirmation by SMS and email. See you soon.
              </p>
            </div>
            <Button asChild>
              <Link href="/patient/sessions">View my sessions</Link>
            </Button>
          </CardContent>
        </Card>
      ) : step === 'paying' ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Smartphone className="h-12 w-12 text-primary" aria-hidden />
            <div>
              <p className="font-display text-xl font-semibold text-on-surface">
                Check your phone
              </p>
              <p className="text-on-surface-variant">
                Enter your M-Pesa PIN to complete payment. This confirms automatically.
              </p>
            </div>
            <p className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Waiting for confirmation… ({payStatus?.paymentStatus ?? 'PENDING'})
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          <Card>
            <CardHeader>
              <CardTitle>1. Choose session length</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SESSION_DURATIONS_MINS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDuration(d);
                      setSlot(null);
                    }}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      duration === d
                        ? 'border-secondary bg-secondary-container/50 text-on-secondary-container'
                        : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {d} min
                    {d === FREE_SESSION_DURATION_MINS ? ' · first free' : ''}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-on-surface-variant">
                {isFreeEligible
                  ? 'Your first 30-minute session is free (if you haven’t used it yet).'
                  : `Fee: ${formatKsh(therapist?.sessionRateKsh)}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Pick a date &amp; time (EAT)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="date"
                min={today}
                max={addDaysISO(today, 30)}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSlot(null);
                }}
                className="max-w-xs"
              />
              {loadingSlots ? (
                <p className="text-sm text-on-surface-variant">Loading times…</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  No open times on this day. Try another date.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={`rounded border px-3 py-2 text-sm transition-colors ${
                        slot === s
                          ? 'border-primary bg-accent text-primary'
                          : 'border-outline-variant text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {formatTimeEAT(s)}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Confirm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isFreeEligible && (
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-on-surface">
                    M-Pesa phone (optional)
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Defaults to your account phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              )}
              <Button disabled={!slot || create.isPending} onClick={() => create.mutate()}>
                {create.isPending
                  ? 'Booking…'
                  : isFreeEligible
                    ? 'Confirm free session'
                    : `Pay ${formatKsh(therapist?.sessionRateKsh)} with M-Pesa`}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
