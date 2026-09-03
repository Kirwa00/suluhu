'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeading } from '@/components/app/stat-card';
import { ApiClientError } from '@/lib/api-client';
import { analyticsApi } from '@/lib/api/analytics-api';
import { formatKsh } from '@/lib/format';
import { useT } from '@/i18n/locale-context';

export default function AdminPayoutsPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['payouts'],
    queryFn: () => analyticsApi.payouts(),
  });

  const pay = useMutation({
    mutationFn: (therapistId: string) => analyticsApi.pay(therapistId),
    onSuccess: (r) => {
      setMsg(
        t('payouts.paidOut', { amount: formatKsh(r.amountKsh), reference: r.reference ?? '—' }),
      );
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
    onError: (err) => setError(err instanceof ApiClientError ? err.message : t('payouts.failed')),
  });

  return (
    <div>
      <PageHeading title={t('payouts.title')} subtitle={t('payouts.subtitle')} />
      {msg && (
        <Alert variant="success" className="mb-4">
          {msg}
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('payouts.queue.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">{t('common.loading')}</p>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-on-surface-variant">{t('payouts.queue.empty')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-left text-on-surface-variant">
                  <th className="py-2 font-medium">{t('payouts.table.therapist')}</th>
                  <th className="py-2 text-right font-medium">{t('payouts.table.netEarned')}</th>
                  <th className="py-2 text-right font-medium">{t('payouts.table.paidOut')}</th>
                  <th className="py-2 text-right font-medium">{t('payouts.table.pending')}</th>
                  <th className="py-2 text-right font-medium">{t('payouts.table.action')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.therapistId} className="border-b border-outline-variant last:border-0">
                    <td className="py-2 text-on-surface">{r.name}</td>
                    <td className="py-2 text-right text-on-surface-variant">
                      {formatKsh(r.netKsh)}
                    </td>
                    <td className="py-2 text-right text-on-surface-variant">
                      {formatKsh(r.paidOutKsh)}
                    </td>
                    <td className="py-2 text-right font-medium text-on-surface">
                      {formatKsh(r.pendingKsh)}
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        size="sm"
                        disabled={r.pendingKsh <= 0 || pay.isPending}
                        onClick={() => pay.mutate(r.therapistId)}
                      >
                        {t('payouts.pay')}
                      </Button>
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
