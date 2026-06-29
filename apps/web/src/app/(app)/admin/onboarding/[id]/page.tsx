'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReviewDecisionInput } from '@suluhu/shared';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ApiClientError } from '@/lib/api-client';
import { adminApi } from '@/lib/api/admin-api';
import { dayName, formatDate, formatKsh, humanizeEnum } from '@/lib/format';

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-outline-variant py-2 text-sm last:border-0">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface">{value}</span>
    </div>
  );
}

export default function AdminApplicationReview() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => adminApi.getApplication(id),
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: (input: ReviewDecisionInput) => adminApi.review(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      router.push('/admin/onboarding');
    },
    onError: (err) =>
      setError(err instanceof ApiClientError ? err.message : 'Action failed. Try again.'),
  });

  const decide = (decision: ReviewDecisionInput['decision']) => {
    setError(null);
    if (decision !== 'APPROVE' && reason.trim().length < 5) {
      setError('Please provide a reason (at least 5 characters).');
      return;
    }
    mutation.mutate({ decision, reason: reason.trim() || undefined });
  };

  if (isLoading) return <p className="text-on-surface-variant">Loading…</p>;
  if (!app)
    return (
      <Card className="p-10 text-center text-on-surface-variant">Application not found.</Card>
    );

  const cpb = app.cpbCheck;

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/onboarding"
        className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to queue
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{app.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Detail label="Title" value={app.title ?? '—'} />
              <Detail label="Email" value={app.email} />
              <Detail label="Phone" value={app.phone} />
              <Detail label="Gender" value={app.gender ? humanizeEnum(app.gender) : '—'} />
              <Detail label="Experience" value={app.yearsExperience != null ? `${app.yearsExperience} years` : '—'} />
              <Detail label="Session rate" value={formatKsh(app.sessionRateKsh)} />
              <Detail label="Languages" value={app.languages.join(', ') || '—'} />
              <Detail label="Specialties" value={app.specialties.map(humanizeEnum).join(', ') || '—'} />
              <Detail label="Submitted" value={formatDate(app.submittedAt)} />
            </CardContent>
          </Card>

          {app.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-on-surface-variant">{app.bio}</p>
              </CardContent>
            </Card>
          )}

          {app.availability.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {app.availability.map((a, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="text-on-surface">{dayName(a.dayOfWeek)}</span>
                      <span className="text-on-surface-variant">
                        {a.startTime}–{a.endTime}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CPB license check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Detail label="License" value={app.cpbLicenseNumber ?? '—'} />
              <Detail label="Expiry" value={formatDate(app.cpbExpiry)} />
              {cpb ? (
                <Alert variant={cpb.valid ? 'success' : 'error'}>
                  Automated check: {cpb.valid ? 'Valid' : 'Not valid'} — {cpb.status}
                </Alert>
              ) : (
                <Alert variant="info">No automated check on record.</Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {error && <Alert variant="error">{error}</Alert>}
              <Textarea
                placeholder="Reason (required for reject/suspend)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <Button className="w-full" onClick={() => decide('APPROVE')} disabled={mutation.isPending}>
                Approve
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => decide('REJECT')}
                disabled={mutation.isPending}
              >
                Reject
              </Button>
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => decide('SUSPEND')}
                disabled={mutation.isPending}
              >
                Suspend
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
