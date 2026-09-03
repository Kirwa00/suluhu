'use client';

import { useQuery } from '@tanstack/react-query';
import { Wallet, Clock, CheckCircle2, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeading, StatCard } from '@/components/app/stat-card';
import { analyticsApi } from '@/lib/api/analytics-api';
import { formatDate, formatKsh, humanizeEnum } from '@/lib/format';
import { useT } from '@/i18n/locale-context';

export default function TherapistEarningsPage() {
  const t = useT();
  const { data } = useQuery({
    queryKey: ['earnings'],
    queryFn: () => analyticsApi.therapistEarnings(),
  });

  return (
    <div className="max-w-3xl">
      <PageHeading title={t('earnings.title')} subtitle={t('earnings.subtitle')} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('earnings.stat.netEarned')}
          value={formatKsh(data?.netKsh ?? 0)}
          icon={Wallet}
          tone="positive"
        />
        <StatCard
          label={t('earnings.stat.pendingPayout')}
          value={formatKsh(data?.pendingKsh ?? 0)}
          icon={Clock}
          tone={data && data.pendingKsh > 0 ? 'attention' : 'neutral'}
        />
        <StatCard
          label={t('earnings.stat.paidOut')}
          value={formatKsh(data?.paidOutKsh ?? 0)}
          icon={CheckCircle2}
        />
        <StatCard
          label={t('earnings.stat.commission')}
          value={data ? `${Math.round(data.commissionRate * 100)}%` : '—'}
          hint={t('earnings.stat.paidSessions', { count: data?.sessions ?? 0 })}
          icon={Percent}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('earnings.transactions.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.transactions.length === 0 ? (
            <p className="text-sm text-on-surface-variant">{t('earnings.transactions.empty')}</p>
          ) : (
            <ul className="divide-y divide-outline-variant text-sm">
              {data.transactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-on-surface">{tx.patientName}</p>
                    <p className="text-xs text-on-surface-variant">{formatDate(tx.paidAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-on-surface">{formatKsh(tx.netKsh)}</p>
                    <p className="text-xs text-on-surface-variant">
                      {t('earnings.transactions.of', { amount: formatKsh(tx.amountKsh) })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('earnings.payouts.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.payouts.length === 0 ? (
            <p className="text-sm text-on-surface-variant">{t('earnings.payouts.empty')}</p>
          ) : (
            <ul className="divide-y divide-outline-variant text-sm">
              {data.payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-on-surface">{formatKsh(p.amountKsh)}</p>
                    <p className="text-xs text-on-surface-variant">
                      {p.reference} · {formatDate(p.createdAt)}
                    </p>
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
