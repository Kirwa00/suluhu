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

export default function AdminPayoutsPage() {
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['payouts'], queryFn: () => analyticsApi.payouts() });

  const pay = useMutation({
    mutationFn: (therapistId: string) => analyticsApi.pay(therapistId),
    onSuccess: (r) => {
      setMsg(`Paid out ${formatKsh(r.amountKsh)} (ref ${r.reference}).`);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
    onError: (err) => setError(err instanceof ApiClientError ? err.message : 'Payout failed.'),
  });

  return (
    <div>
      <PageHeading title="Therapist payouts" subtitle="Settle pending balances via M-Pesa B2C." />
      {msg && <Alert variant="success" className="mb-4">{msg}</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Payout queue</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">Loading…</p>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No therapists yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-left text-on-surface-variant">
                  <th className="py-2 font-medium">Therapist</th>
                  <th className="py-2 text-right font-medium">Net earned</th>
                  <th className="py-2 text-right font-medium">Paid out</th>
                  <th className="py-2 text-right font-medium">Pending</th>
                  <th className="py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.therapistId} className="border-b border-outline-variant last:border-0">
                    <td className="py-2 text-on-surface">{r.name}</td>
                    <td className="py-2 text-right text-on-surface-variant">{formatKsh(r.netKsh)}</td>
                    <td className="py-2 text-right text-on-surface-variant">{formatKsh(r.paidOutKsh)}</td>
                    <td className="py-2 text-right font-medium text-on-surface">{formatKsh(r.pendingKsh)}</td>
                    <td className="py-2 text-right">
                      <Button
                        size="sm"
                        disabled={r.pendingKsh <= 0 || pay.isPending}
                        onClick={() => pay.mutate(r.therapistId)}
                      >
                        Pay
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
