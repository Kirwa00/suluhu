'use client';

import { useQuery } from '@tanstack/react-query';
import { CreditCard, ShieldCheck, UserCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeading, StatCard } from '@/components/app/stat-card';
import { analyticsApi } from '@/lib/api/analytics-api';
import { useAuth } from '@/lib/auth/auth-context';
import { formatKsh } from '@/lib/format';

export default function AdminDashboard() {
  const { user } = useAuth();
  const name = user?.email.split('@')[0] ?? 'admin';
  const { data } = useQuery({ queryKey: ['admin-metrics'], queryFn: () => analyticsApi.adminMetrics() });

  return (
    <div>
      <PageHeading title="Operations overview" subtitle={`Signed in as ${name}. Platform health and compliance.`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active therapists" value={String(data?.activeTherapists ?? '—')} icon={UserCheck} />
        <StatCard label="Patients" value={String(data?.patients ?? '—')} icon={Users} />
        <StatCard
          label="Pending verifications"
          value={String(data?.pendingVerifications ?? '—')}
          icon={ShieldCheck}
          tone={data && data.pendingVerifications > 0 ? 'attention' : 'neutral'}
        />
        <StatCard
          label="Revenue (MTD)"
          value={formatKsh(data?.revenue.grossMtdKsh ?? 0)}
          hint={data ? `Platform: ${formatKsh(data.revenue.platformNetMtdKsh)}` : undefined}
          icon={CreditCard}
          tone="positive"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump to the areas that need attention.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/admin/onboarding">Review onboarding ({data?.pendingVerifications ?? 0})</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/alerts">Clinical alerts ({data?.openAlerts ?? 0})</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/payouts">Therapist payouts</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/revenue">Revenue</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
            <CardDescription>Immutable audit trail &amp; alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex items-center justify-between">
              <span>Open clinical alerts</span>
              <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs">
                {data?.openAlerts ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Audit log</span>
              <Link href="/admin/audit" className="text-secondary hover:underline">
                View
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span>Data residency</span>
              <span className="rounded-full bg-secondary-container/50 px-2 py-0.5 text-xs text-on-secondary-container">
                Africa
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
