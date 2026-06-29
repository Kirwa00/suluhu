'use client';

import { useQuery } from '@tanstack/react-query';
import { TherapistVerificationStatus } from '@suluhu/shared';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { PageHeading } from '@/components/app/stat-card';
import { adminApi } from '@/lib/api/admin-api';
import { formatDate, humanizeEnum } from '@/lib/format';

export default function AdminOnboardingQueue() {
  const [status, setStatus] = useState<string>(TherapistVerificationStatus.IN_REVIEW);

  const { data, isLoading } = useQuery({
    queryKey: ['applications', status],
    queryFn: () => adminApi.listApplications({ status, pageSize: 50 }),
  });

  return (
    <div>
      <PageHeading
        title="Therapist onboarding"
        subtitle="Review CPB credentials and approve therapists for the platform."
      />

      <div className="mb-4 max-w-xs">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          {Object.values(TherapistVerificationStatus).map((s) => (
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
          No applications with status “{humanizeEnum(status)}”.
        </Card>
      ) : (
        <Card className="divide-y divide-outline-variant">
          {data.items.map((app) => (
            <Link
              key={app.id}
              href={`/admin/onboarding/${app.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-surface-container"
            >
              <div className="min-w-0">
                <p className="font-medium text-on-surface">{app.name}</p>
                <p className="truncate text-sm text-on-surface-variant">
                  {app.title} · {app.cpbLicenseNumber}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {app.cpbCheck && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      app.cpbCheck.valid
                        ? 'bg-secondary-container/50 text-on-secondary-container'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    CPB {app.cpbCheck.status}
                  </span>
                )}
                <span className="hidden text-sm text-on-surface-variant sm:inline">
                  {formatDate(app.submittedAt)}
                </span>
                <ChevronRight className="h-5 w-5 text-on-surface-variant" aria-hidden />
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
