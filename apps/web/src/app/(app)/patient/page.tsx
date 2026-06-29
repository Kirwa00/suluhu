'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Compass, HeartPulse, LibraryBig, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeading, StatCard } from '@/components/app/stat-card';
import { useAuth } from '@/lib/auth/auth-context';
import { appointmentsApi } from '@/lib/api/appointments-api';
import { moodApi } from '@/lib/api/engagement-api';
import { usersApi } from '@/lib/api/users-api';
import { formatDateTimeEAT } from '@/lib/format';

export default function PatientDashboard() {
  const { user } = useAuth();
  const name = user?.email.split('@')[0] ?? 'there';

  const { data: upcoming } = useQuery({ queryKey: ['appointments', 'upcoming'], queryFn: () => appointmentsApi.list('upcoming') });
  const { data: mood } = useQuery({ queryKey: ['mood'], queryFn: () => moodApi.list() });
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => usersApi.getProfile() });

  const freeUsed = profile?.patient?.freeSessionsUsed ?? 0;
  const next = upcoming?.[0];

  return (
    <div>
      <PageHeading title={`Karibu, ${name}`} subtitle="Your space for calm, confidential support. Take your time." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming sessions" value={String(upcoming?.length ?? 0)} icon={CalendarDays} />
        <StatCard label="Mood check-ins" value={String(mood?.entries.length ?? 0)} hint={mood?.average != null ? `Avg ${mood.average}/10` : undefined} icon={HeartPulse} />
        <StatCard label="Free session" value={freeUsed > 0 ? 'Used' : 'Available'} hint="First 30 min on us" icon={Sparkles} tone={freeUsed > 0 ? 'neutral' : 'positive'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your next session</CardTitle>
            <CardDescription>{next ? 'Upcoming appointment' : 'When you book a session, it will appear here.'}</CardDescription>
          </CardHeader>
          <CardContent>
            {next ? (
              <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-soothing p-4">
                <div>
                  <p className="font-medium text-on-surface">{next.therapist.name}</p>
                  <p className="text-sm text-on-surface-variant">{formatDateTimeEAT(next.scheduledAt)} · {next.durationMins} min</p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/session/${next.id}`}>Join</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed border-outline-variant bg-surface-soothing py-10 text-center">
                <Compass className="h-8 w-8 text-secondary" aria-hidden />
                <div>
                  <p className="font-medium text-on-surface">You haven’t booked a session yet</p>
                  <p className="text-sm text-on-surface-variant">Find a CPB-licensed therapist who fits your needs.</p>
                </div>
                <Button asChild>
                  <Link href="/patient/therapists">Find a therapist</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wellbeing check-in</CardTitle>
            <CardDescription>A quick, private way to understand how you’re doing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              Complete a short, confidential assessment (PHQ-9 / GAD-7) and we’ll suggest the right support — at your pace.
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/patient/intake">Start check-in</Link>
            </Button>
            <Link href="/patient/resources" className="flex items-center gap-2 text-sm text-secondary hover:underline">
              <LibraryBig className="h-4 w-4" aria-hidden />
              Explore self-help resources
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
