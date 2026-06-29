'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock, MessageSquare, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { appointmentsApi, type AppointmentView } from '@/lib/api/appointments-api';
import { messagingApi } from '@/lib/api/engagement-api';
import { formatDateTimeEAT, formatKsh, humanizeEnum } from '@/lib/format';

const statusStyles: Record<string, string> = {
  SCHEDULED: 'bg-secondary-container/50 text-on-secondary-container',
  PENDING_PAYMENT: 'bg-error-container text-on-error-container',
  IN_PROGRESS: 'bg-accent text-secondary',
  COMPLETED: 'bg-surface-container text-on-surface-variant',
  CANCELLED: 'bg-surface-container text-on-surface-variant',
  NO_SHOW: 'bg-error-container text-on-error-container',
};

export function AppointmentsPanel({ viewer }: { viewer: 'patient' | 'therapist' }) {
  const [scope, setScope] = useState<'upcoming' | 'past'>('upcoming');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', scope],
    queryFn: () => appointmentsApi.list(scope),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => appointmentsApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-outline-variant bg-surface-container-lowest p-1">
        {(['upcoming', 'past'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              scope === s ? 'bg-accent text-primary' : 'text-on-surface-variant'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-on-surface-variant">Loading…</p>
      ) : !data || data.length === 0 ? (
        <Card className="p-10 text-center text-on-surface-variant">
          No {scope} sessions.
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <AppointmentRow
              key={a.id}
              a={a}
              viewer={viewer}
              canCancel={scope === 'upcoming'}
              onCancel={() => cancel.mutate(a.id)}
              cancelling={cancel.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentRow({
  a,
  viewer,
  canCancel,
  onCancel,
  cancelling,
}: {
  a: AppointmentView;
  viewer: 'patient' | 'therapist';
  canCancel: boolean;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const counterpart = viewer === 'patient' ? a.therapist.name : a.patient.name;
  const counterpartId = viewer === 'patient' ? a.therapistId : a.patientId;
  const router = useRouter();
  const message = useMutation({
    mutationFn: () => messagingApi.open(counterpartId),
    onSuccess: (c) => router.push(`/${viewer}/messages?c=${c.id}`),
  });
  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-secondary">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="font-medium text-on-surface">{counterpart}</p>
          <p className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {formatDateTimeEAT(a.scheduledAt)} · {a.durationMins} min
          </p>
          <p className="text-sm text-on-surface-variant">
            {a.isFreeSession ? 'Free session' : formatKsh(a.priceKsh)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[a.status] ?? ''}`}>
          {humanizeEnum(a.status)}
        </span>
        <Button variant="ghost" size="sm" onClick={() => message.mutate()} disabled={message.isPending}>
          <MessageSquare className="h-4 w-4" aria-hidden />
          Message
        </Button>
        {(a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS') && (
          <Button asChild size="sm">
            <Link href={`/session/${a.id}`}>
              <Video className="h-4 w-4" aria-hidden />
              {a.status === 'IN_PROGRESS' ? 'Rejoin' : 'Join'}
            </Link>
          </Button>
        )}
        {canCancel && (a.status === 'SCHEDULED' || a.status === 'PENDING_PAYMENT') && (
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={cancelling}>
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}
