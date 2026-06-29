'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageHeading } from '@/components/app/stat-card';
import { clinicalApi } from '@/lib/api/clinical-api';
import { formatDate, humanizeEnum } from '@/lib/format';

const riskStyles: Record<string, string> = {
  SEVERE: 'bg-error-container text-on-error-container',
  MODERATELY_SEVERE: 'bg-error-container text-on-error-container',
  MODERATE: 'bg-accent text-secondary',
  MILD: 'bg-surface-container text-on-surface-variant',
  MINIMAL: 'bg-secondary-container/50 text-on-secondary-container',
};

export default function TherapistClientsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['clients'], queryFn: () => clinicalApi.clients() });

  return (
    <div>
      <PageHeading title="Clients" subtitle="Your caseload. Open a client to view their record and notes." />

      {isLoading ? (
        <p className="text-on-surface-variant">Loading…</p>
      ) : !data || data.length === 0 ? (
        <Card className="p-10 text-center text-on-surface-variant">
          No clients yet. Patients appear here once they book with you.
        </Card>
      ) : (
        <Card className="divide-y divide-outline-variant">
          {data.map((c) => (
            <Link
              key={c.id}
              href={`/therapist/clients/${c.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-surface-container"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-on-primary">
                  {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
                <div>
                  <p className="font-medium text-on-surface">{c.name}</p>
                  <p className="text-sm text-on-surface-variant">
                    {c.count} session{c.count === 1 ? '' : 's'} · last {formatDate(c.lastSession)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {c.riskLevel && (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${riskStyles[c.riskLevel] ?? ''}`}>
                    {humanizeEnum(c.riskLevel)}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-on-surface-variant" aria-hidden />
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
