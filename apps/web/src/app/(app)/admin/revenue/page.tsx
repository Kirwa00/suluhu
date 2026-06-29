'use client';

import { useQuery } from '@tanstack/react-query';
import { CreditCard, Percent, Users, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeading, StatCard } from '@/components/app/stat-card';
import { analyticsApi } from '@/lib/api/analytics-api';
import { formatKsh } from '@/lib/format';

export default function AdminRevenuePage() {
  const { data: metrics } = useQuery({ queryKey: ['admin-metrics'], queryFn: () => analyticsApi.adminMetrics() });
  const { data: rows } = useQuery({ queryKey: ['admin-revenue'], queryFn: () => analyticsApi.revenue() });

  return (
    <div>
      <PageHeading title="Revenue" subtitle="Gross billings, platform commission, and therapist earnings." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gross (MTD)" value={formatKsh(metrics?.revenue.grossMtdKsh ?? 0)} icon={CreditCard} tone="positive" />
        <StatCard label="Platform net (MTD)" value={formatKsh(metrics?.revenue.platformNetMtdKsh ?? 0)} icon={Wallet} />
        <StatCard label="Therapist earnings (MTD)" value={formatKsh(metrics?.revenue.therapistEarningsMtdKsh ?? 0)} icon={Users} />
        <StatCard
          label="Commission"
          value={metrics ? `${Math.round(metrics.revenue.commissionRate * 100)}%` : '—'}
          hint={`${metrics?.revenue.paidSessionsMtd ?? 0} paid sessions MTD`}
          icon={Percent}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Revenue by therapist (all time)</CardTitle>
        </CardHeader>
        <CardContent>
          {!rows || rows.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No revenue yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-left text-on-surface-variant">
                  <th className="py-2 font-medium">Therapist</th>
                  <th className="py-2 text-right font-medium">Sessions</th>
                  <th className="py-2 text-right font-medium">Gross</th>
                  <th className="py-2 text-right font-medium">Therapist net</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.therapistId} className="border-b border-outline-variant last:border-0">
                    <td className="py-2 text-on-surface">{r.name}</td>
                    <td className="py-2 text-right text-on-surface-variant">{r.sessions}</td>
                    <td className="py-2 text-right text-on-surface">{formatKsh(r.grossKsh)}</td>
                    <td className="py-2 text-right text-on-surface-variant">{formatKsh(r.netKsh)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
