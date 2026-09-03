'use client';

import { useQuery } from '@tanstack/react-query';
import { CreditCard, Percent, Users, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeading, StatCard } from '@/components/app/stat-card';
import { analyticsApi } from '@/lib/api/analytics-api';
import { formatKsh } from '@/lib/format';
import { useT } from '@/i18n/locale-context';

export default function AdminRevenuePage() {
  const t = useT();
  const { data: metrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => analyticsApi.adminMetrics(),
  });
  const { data: rows } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => analyticsApi.revenue(),
  });

  return (
    <div>
      <PageHeading title={t('revenue.title')} subtitle={t('revenue.subtitle')} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('revenue.stat.grossMtd')}
          value={formatKsh(metrics?.revenue.grossMtdKsh ?? 0)}
          icon={CreditCard}
          tone="positive"
        />
        <StatCard
          label={t('revenue.stat.platformNetMtd')}
          value={formatKsh(metrics?.revenue.platformNetMtdKsh ?? 0)}
          icon={Wallet}
        />
        <StatCard
          label={t('revenue.stat.therapistEarningsMtd')}
          value={formatKsh(metrics?.revenue.therapistEarningsMtdKsh ?? 0)}
          icon={Users}
        />
        <StatCard
          label={t('revenue.stat.commission')}
          value={metrics ? `${Math.round(metrics.revenue.commissionRate * 100)}%` : '—'}
          hint={t('revenue.stat.paidSessionsMtd', { count: metrics?.revenue.paidSessionsMtd ?? 0 })}
          icon={Percent}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('revenue.byTherapist.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!rows || rows.length === 0 ? (
            <p className="text-sm text-on-surface-variant">{t('revenue.byTherapist.empty')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-left text-on-surface-variant">
                  <th className="py-2 font-medium">{t('revenue.table.therapist')}</th>
                  <th className="py-2 text-right font-medium">{t('revenue.table.sessions')}</th>
                  <th className="py-2 text-right font-medium">{t('revenue.table.gross')}</th>
                  <th className="py-2 text-right font-medium">{t('revenue.table.therapistNet')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.therapistId} className="border-b border-outline-variant last:border-0">
                    <td className="py-2 text-on-surface">{r.name}</td>
                    <td className="py-2 text-right text-on-surface-variant">{r.sessions}</td>
                    <td className="py-2 text-right text-on-surface">{formatKsh(r.grossKsh)}</td>
                    <td className="py-2 text-right text-on-surface-variant">
                      {formatKsh(r.netKsh)}
                    </td>
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
