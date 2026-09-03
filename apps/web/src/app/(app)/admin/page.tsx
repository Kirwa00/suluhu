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
import { useT } from '@/i18n/locale-context';

export default function AdminDashboard() {
  const { user } = useAuth();
  const t = useT();
  const name = user?.email.split('@')[0] ?? 'admin';
  const { data } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => analyticsApi.adminMetrics(),
  });

  return (
    <div>
      <PageHeading
        title={t('dashboard.admin.title')}
        subtitle={t('dashboard.admin.subtitle', { name })}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('dashboard.admin.stat.activeTherapists')}
          value={String(data?.activeTherapists ?? '—')}
          icon={UserCheck}
        />
        <StatCard
          label={t('dashboard.admin.stat.patients')}
          value={String(data?.patients ?? '—')}
          icon={Users}
        />
        <StatCard
          label={t('dashboard.admin.stat.pendingVerifications')}
          value={String(data?.pendingVerifications ?? '—')}
          icon={ShieldCheck}
          tone={data && data.pendingVerifications > 0 ? 'attention' : 'neutral'}
        />
        <StatCard
          label={t('dashboard.admin.stat.revenueMtd')}
          value={formatKsh(data?.revenue.grossMtdKsh ?? 0)}
          hint={
            data
              ? t('dashboard.admin.stat.platformHint', {
                  amount: formatKsh(data.revenue.platformNetMtdKsh),
                })
              : undefined
          }
          icon={CreditCard}
          tone="positive"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.admin.quickActions.title')}</CardTitle>
            <CardDescription>{t('dashboard.admin.quickActions.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/admin/onboarding">
                {t('dashboard.admin.quickActions.reviewOnboarding', {
                  count: data?.pendingVerifications ?? 0,
                })}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/alerts">
                {t('dashboard.admin.quickActions.clinicalAlerts', {
                  count: data?.openAlerts ?? 0,
                })}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/payouts">{t('dashboard.admin.quickActions.payouts')}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/revenue">{t('dashboard.admin.quickActions.revenue')}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.admin.compliance.title')}</CardTitle>
            <CardDescription>{t('dashboard.admin.compliance.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex items-center justify-between">
              <span>{t('dashboard.admin.compliance.openAlerts')}</span>
              <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs">
                {data?.openAlerts ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('dashboard.admin.compliance.auditLog')}</span>
              <Link href="/admin/audit" className="text-secondary hover:underline">
                {t('dashboard.admin.compliance.view')}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('dashboard.admin.compliance.dataResidency')}</span>
              <span className="rounded-full bg-secondary-container/50 px-2 py-0.5 text-xs text-on-secondary-container">
                {t('dashboard.admin.compliance.africa')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
