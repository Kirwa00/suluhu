'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Users, Wallet, Clock } from 'lucide-react';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeading, StatCard } from '@/components/app/stat-card';
import { useAuth } from '@/lib/auth/auth-context';
import { appointmentsApi } from '@/lib/api/appointments-api';
import { clinicalApi } from '@/lib/api/clinical-api';
import { analyticsApi } from '@/lib/api/analytics-api';
import { therapistsApi } from '@/lib/api/therapists-api';
import { formatDateTimeEAT, formatKsh } from '@/lib/format';

export default function TherapistDashboard() {
  const { user } = useAuth();
  const name = user?.email.split('@')[0] ?? 'therapist';

  const { data: upcoming } = useQuery({ queryKey: ['appointments', 'upcoming'], queryFn: () => appointmentsApi.list('upcoming') });
  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: () => clinicalApi.clients() });
  const { data: earnings } = useQuery({ queryKey: ['earnings'], queryFn: () => analyticsApi.therapistEarnings() });
  const { data: onboarding } = useQuery({ queryKey: ['onboarding'], queryFn: () => therapistsApi.getOnboarding() });

  const notApproved = onboarding && onboarding.verificationStatus !== 'APPROVED';

  return (
    <div>
      <PageHeading title={`Welcome, ${name}`} subtitle="Your caseload at a glance." />

      {notApproved && (
        <Link href="/therapist/onboarding" className="mb-6 block">
          <Alert variant="info">
            <p className="font-medium">Complete your onboarding →</p>
            <p>Verify your CPB license to start accepting clients and appear in discovery.</p>
          </Alert>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming sessions" value={String(upcoming?.length ?? 0)} icon={CalendarDays} />
        <StatCard label="Active clients" value={String(clients?.length ?? 0)} icon={Users} />
        <StatCard label="Net earnings" value={formatKsh(earnings?.netKsh ?? 0)} icon={Wallet} tone="positive" />
        <StatCard label="Pending payout" value={formatKsh(earnings?.pendingKsh ?? 0)} icon={Clock} tone={earnings && earnings.pendingKsh > 0 ? 'attention' : 'neutral'} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Upcoming sessions</CardTitle>
          <CardDescription>Your next appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          {!upcoming || upcoming.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No sessions scheduled.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {upcoming.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{a.patient.name}</p>
                    <p className="text-xs text-on-surface-variant">{formatDateTimeEAT(a.scheduledAt)} · {a.durationMins} min</p>
                  </div>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/session/${a.id}`}>Open</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
