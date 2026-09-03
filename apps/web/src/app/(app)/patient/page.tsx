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
import { useT } from '@/i18n/locale-context';

export default function PatientDashboard() {
  const { user } = useAuth();
  const t = useT();
  const name = user?.email.split('@')[0] ?? 'there';

  const { data: upcoming } = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: () => appointmentsApi.list('upcoming'),
  });
  const { data: mood } = useQuery({ queryKey: ['mood'], queryFn: () => moodApi.list() });
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.getProfile(),
  });

  const freeUsed = profile?.patient?.freeSessionsUsed ?? 0;
  const next = upcoming?.[0];

  return (
    <div>
      <PageHeading
        title={t('dashboard.patient.welcome', { name })}
        subtitle={t('dashboard.patient.subtitle')}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t('dashboard.patient.stat.upcomingSessions')}
          value={String(upcoming?.length ?? 0)}
          icon={CalendarDays}
        />
        <StatCard
          label={t('dashboard.patient.stat.moodCheckins')}
          value={String(mood?.entries.length ?? 0)}
          hint={
            mood?.average != null
              ? t('dashboard.patient.stat.moodAvg', { avg: mood.average })
              : undefined
          }
          icon={HeartPulse}
        />
        <StatCard
          label={t('dashboard.patient.stat.freeSession')}
          value={
            freeUsed > 0
              ? t('dashboard.patient.stat.freeSessionUsed')
              : t('dashboard.patient.stat.freeSessionAvailable')
          }
          hint={t('dashboard.patient.stat.freeSessionHint')}
          icon={Sparkles}
          tone={freeUsed > 0 ? 'neutral' : 'positive'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.patient.nextSession.title')}</CardTitle>
            <CardDescription>
              {next
                ? t('dashboard.patient.nextSession.upcoming')
                : t('dashboard.patient.nextSession.empty')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {next ? (
              <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-soothing p-4">
                <div>
                  <p className="font-medium text-on-surface">{next.therapist.name}</p>
                  <p className="text-sm text-on-surface-variant">
                    {formatDateTimeEAT(next.scheduledAt)} ·{' '}
                    {t('dashboard.patient.nextSession.duration', { mins: next.durationMins })}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/session/${next.id}`}>
                    {t('dashboard.patient.nextSession.join')}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed border-outline-variant bg-surface-soothing py-10 text-center">
                <Compass className="h-8 w-8 text-secondary" aria-hidden />
                <div>
                  <p className="font-medium text-on-surface">
                    {t('dashboard.patient.nextSession.noneTitle')}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {t('dashboard.patient.nextSession.noneBody')}
                  </p>
                </div>
                <Button asChild>
                  <Link href="/patient/therapists">
                    {t('dashboard.patient.nextSession.findTherapist')}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.patient.checkin.title')}</CardTitle>
            <CardDescription>{t('dashboard.patient.checkin.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-on-surface-variant">{t('dashboard.patient.checkin.body')}</p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/patient/intake">{t('dashboard.patient.checkin.start')}</Link>
            </Button>
            <Link
              href="/patient/resources"
              className="flex items-center gap-2 text-sm text-secondary hover:underline"
            >
              <LibraryBig className="h-4 w-4" aria-hidden />
              {t('dashboard.patient.checkin.exploreResources')}
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
