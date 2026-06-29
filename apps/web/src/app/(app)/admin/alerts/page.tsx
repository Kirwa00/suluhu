'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Phone, Siren } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { PageHeading } from '@/components/app/stat-card';
import { adminApi, type AlertItem } from '@/lib/api/admin-api';
import { formatDateTimeEAT, humanizeEnum } from '@/lib/format';

const STATUSES = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'];

export default function AdminAlertsPage() {
  const [status, setStatus] = useState('OPEN');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', status],
    queryFn: () => adminApi.listAlerts({ status, pageSize: 50 }),
  });

  const ack = useMutation({
    mutationFn: (id: string) => adminApi.acknowledgeAlert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
  const resolve = useMutation({
    mutationFn: (id: string) => adminApi.resolveAlert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  return (
    <div>
      <PageHeading
        title="Clinical alerts"
        subtitle="Crisis and high-risk escalations from patient intake. Respond promptly."
      />

      <div className="mb-4 max-w-xs">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter status">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanizeEnum(s)}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <p className="text-on-surface-variant">Loading…</p>
      ) : !data || data.items.length === 0 ? (
        <Card className="p-10 text-center text-on-surface-variant">
          No {humanizeEnum(status).toLowerCase()} alerts.
        </Card>
      ) : (
        <div className="space-y-3">
          {data.items.map((a) => (
            <AlertCard
              key={a.id}
              a={a}
              onAck={() => ack.mutate(a.id)}
              onResolve={() => resolve.mutate(a.id)}
              busy={ack.isPending || resolve.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertCard({
  a,
  onAck,
  onResolve,
  busy,
}: {
  a: AlertItem;
  onAck: () => void;
  onResolve: () => void;
  busy: boolean;
}) {
  const crisis = a.type === 'CRISIS';
  return (
    <Card className={`p-4 ${crisis ? 'border-safety-amber' : ''}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-md ${
              crisis ? 'bg-error-container text-on-error-container' : 'bg-accent text-secondary'
            }`}
          >
            <Siren className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-medium text-on-surface">
              {humanizeEnum(a.type)} · {a.patientName}
            </p>
            <p className="text-sm text-on-surface-variant">{a.message}</p>
            <p className="mt-1 flex items-center gap-3 text-xs text-on-surface-variant">
              <span>{formatDateTimeEAT(a.createdAt)}</span>
              <a href={`tel:${a.patientPhone}`} className="flex items-center gap-1 text-secondary hover:underline">
                <Phone className="h-3 w-3" aria-hidden />
                {a.patientPhone}
              </a>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {a.status === 'OPEN' && (
            <Button variant="secondary" size="sm" onClick={onAck} disabled={busy}>
              Acknowledge
            </Button>
          )}
          {a.status !== 'RESOLVED' && (
            <Button size="sm" onClick={onResolve} disabled={busy}>
              Resolve
            </Button>
          )}
          {a.status === 'RESOLVED' && (
            <span className="rounded-full bg-secondary-container/50 px-2 py-1 text-xs text-on-secondary-container">
              Resolved
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
