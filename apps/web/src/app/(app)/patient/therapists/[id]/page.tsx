'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Globe, Star } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { therapistsApi } from '@/lib/api/therapists-api';
import { dayName, formatKsh, humanizeEnum } from '@/lib/format';
import { useT } from '@/i18n/locale-context';

export default function TherapistProfilePage() {
  const t = useT();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const {
    data: th,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['therapist', id],
    queryFn: () => therapistsApi.getDetail(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <p className="text-on-surface-variant">{t('therapistProfile.loading')}</p>;
  if (isError || !th)
    return (
      <div>
        <BackLink />
        <Card className="mt-4 p-10 text-center text-on-surface-variant">
          {t('therapistProfile.notFound')}
        </Card>
      </div>
    );

  return (
    <div className="max-w-4xl">
      <BackLink />

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-2xl font-semibold text-on-primary">
                  {th.firstName[0]}
                  {th.lastName[0]}
                </span>
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold text-on-surface">
                    {th.firstName} {th.lastName}
                  </h1>
                  <p className="text-on-surface-variant">{th.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-secondary" aria-hidden />
                      {th.ratingAvg ? th.ratingAvg.toFixed(1) : t('therapistProfile.new')}
                    </span>
                    {th.yearsExperience != null && (
                      <span>
                        {t('therapistProfile.yearsExperience', { years: th.yearsExperience })}
                      </span>
                    )}
                    {th.gender && <span>{humanizeEnum(th.gender)}</span>}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {th.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-accent px-2.5 py-1 text-xs text-secondary"
                  >
                    {humanizeEnum(s)}
                  </span>
                ))}
              </div>

              {th.languages.length > 0 && (
                <p className="mt-3 flex items-center gap-2 text-sm text-on-surface-variant">
                  <Globe className="h-4 w-4" aria-hidden />
                  {th.languages.join(', ')}
                </p>
              )}
            </CardContent>
          </Card>

          {th.bio && (
            <Card>
              <CardHeader>
                <CardTitle>{t('therapistProfile.about.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-on-surface-variant">{th.bio}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('therapistProfile.availability.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {th.availability.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  {t('therapistProfile.availability.empty')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {th.availability.map((a, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-on-surface">{dayName(a.dayOfWeek)}</span>
                      <span className="text-on-surface-variant">
                        {a.startTime} – {a.endTime} {t('therapistProfile.eat')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-sm text-on-surface-variant">
                  {t('therapistProfile.sessionFee')}
                </p>
                <p className="font-display text-2xl font-bold text-on-surface">
                  {formatKsh(th.sessionRateKsh)}
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href={`/patient/therapists/${th.id}/book`}>
                  {t('therapistProfile.bookSession')}
                </Link>
              </Button>
              <p className="text-center text-xs text-on-surface-variant">
                {t('therapistProfile.freeSessionNote')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  const t = useT();
  return (
    <Link
      href="/patient/therapists"
      className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {t('therapistProfile.back')}
    </Link>
  );
}
