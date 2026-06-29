'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Globe, Star } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { therapistsApi } from '@/lib/api/therapists-api';
import { dayName, formatKsh, humanizeEnum } from '@/lib/format';

export default function TherapistProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: t, isLoading, isError } = useQuery({
    queryKey: ['therapist', id],
    queryFn: () => therapistsApi.getDetail(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <p className="text-on-surface-variant">Loading…</p>;
  if (isError || !t)
    return (
      <div>
        <BackLink />
        <Card className="mt-4 p-10 text-center text-on-surface-variant">Therapist not found.</Card>
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
                  {t.firstName[0]}
                  {t.lastName[0]}
                </span>
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold text-on-surface">
                    {t.firstName} {t.lastName}
                  </h1>
                  <p className="text-on-surface-variant">{t.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-secondary" aria-hidden />
                      {t.ratingAvg ? t.ratingAvg.toFixed(1) : 'New'}
                    </span>
                    {t.yearsExperience != null && <span>{t.yearsExperience} yrs experience</span>}
                    {t.gender && <span>{humanizeEnum(t.gender)}</span>}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.specialties.map((s) => (
                  <span key={s} className="rounded-full bg-accent px-2.5 py-1 text-xs text-secondary">
                    {humanizeEnum(s)}
                  </span>
                ))}
              </div>

              {t.languages.length > 0 && (
                <p className="mt-3 flex items-center gap-2 text-sm text-on-surface-variant">
                  <Globe className="h-4 w-4" aria-hidden />
                  {t.languages.join(', ')}
                </p>
              )}
            </CardContent>
          </Card>

          {t.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-on-surface-variant">{t.bio}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Weekly availability</CardTitle>
            </CardHeader>
            <CardContent>
              {t.availability.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No availability published yet.</p>
              ) : (
                <ul className="space-y-2">
                  {t.availability.map((a, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-on-surface">{dayName(a.dayOfWeek)}</span>
                      <span className="text-on-surface-variant">
                        {a.startTime} – {a.endTime} EAT
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
                <p className="text-sm text-on-surface-variant">Session fee</p>
                <p className="font-display text-2xl font-bold text-on-surface">
                  {formatKsh(t.sessionRateKsh)}
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href={`/patient/therapists/${t.id}/book`}>Book a session</Link>
              </Button>
              <p className="text-center text-xs text-on-surface-variant">
                First 30-minute session free · M-Pesa accepted
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/patient/therapists"
      className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back to therapists
    </Link>
  );
}
