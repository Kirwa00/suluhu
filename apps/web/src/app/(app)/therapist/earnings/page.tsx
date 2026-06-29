'use client';

import { useQuery } from '@tanstack/react-query';
import { Wallet, Clock, CheckCircle2, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeading, StatCard } from '@/components/app/stat-card';
import { analyticsApi } from '@/lib/api/analytics-api';
import { formatDate, formatKsh, humanizeEnum } from '@/lib/format';

export default function TherapistEarningsPage() {
  const { data } = useQuery({ queryKey: ['earnings'], queryFn: () => analyticsApi.therapistEarnings() });

  return (
    <div className="max-w-3xl">
      <PageHeading title="Earnings" subtitle="Your net earnings after the platform commission, and payout history." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Net earned" value={formatKsh(data?.netKsh ?? 0)} icon={Wallet} tone="positive" />
        <StatCard label="Pending payout" value={formatKsh(data?.pendingKsh ?? 0)} icon={Clock} tone={data && data.pendingKsh > 0 ? 'attention' : 'neutral'} />
        <StatCard label="Paid out" value={formatKsh(data?.paidOutKsh ?? 0)} icon={CheckCircle2} />
        <StatCard label="Commission" value={data ? `${Math.round(data.commissionRate * 100)}%` : '—'} hint={`${data?.sessions ?? 0} paid sessions`} icon={Percent} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.transactions.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No paid sessions yet.</p>
          ) : (
            <ul className="divide-y divide-outline-variant text-sm">
              {data.transactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-on-surface">{t.patientName}</p>
                    <p className="text-xs text-on-surface-variant">{formatDate(t.paidAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-on-surface">{formatKsh(t.netKsh)}</p>
                    <p className="text-xs text-on-surface-variant">of {formatKsh(t.amountKsh)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Payout history</CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.payouts.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No payouts yet.</p>
          ) : (
            <ul className="divide-y divide-outline-variant text-sm">
              {data.payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-on-surface">{formatKsh(p.amountKsh)}</p>
                    <p className="text-xs text-on-surface-variant">{p.reference} · {formatDate(p.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-secondary-container/50 px-2 py-0.5 text-xs text-on-secondary-container">
                    {humanizeEnum(p.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
