'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeading } from '@/components/app/stat-card';
import { clinicalApi } from '@/lib/api/clinical-api';
import { useAuth } from '@/lib/auth/auth-context';
import { formatDate, formatDateTimeEAT, humanizeEnum } from '@/lib/format';

export default function PatientRecordPage() {
  const { user } = useAuth();
  const patientId = user?.id;

  const { data: record } = useQuery({
    queryKey: ['record', patientId],
    queryFn: () => clinicalApi.healthRecord(patientId as string),
    enabled: Boolean(patientId),
  });
  const { data: notes } = useQuery({
    queryKey: ['notes', patientId],
    queryFn: () => clinicalApi.patientNotes(patientId as string),
    enabled: Boolean(patientId),
  });

  if (!record) return <p className="text-on-surface-variant">Loading your record…</p>;

  return (
    <div className="max-w-3xl">
      <PageHeading title="My health record" subtitle="Your wellbeing journey on Suluhu." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Latest check-in</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {record.latestIntake ? (
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ['PHQ-9', record.latestIntake.phq9Score, 27],
                  ['GAD-7', record.latestIntake.gad7Score, 21],
                  ['CAGE', record.latestIntake.cageScore, 4],
                ].map(([l, s, m]) => (
                  <div key={l as string} className="rounded-md bg-surface-soothing p-3">
                    <p className="font-display text-xl font-bold text-on-surface">
                      {s as number}
                      <span className="text-sm font-normal text-on-surface-variant">/{m as number}</span>
                    </p>
                    <p className="text-xs text-on-surface-variant">{l as string}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant">No check-in yet.</p>
            )}
          </CardContent>
        </Card>

        {record.treatmentPlan && (
          <Card>
            <CardHeader>
              <CardTitle>Treatment plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-on-surface">Goals</p>
              <ul className="list-inside list-disc text-on-surface-variant">
                {record.treatmentPlan.goals.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {record.appointments.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No sessions yet.</p>
            ) : (
              <ul className="divide-y divide-outline-variant text-sm">
                {record.appointments.map((a) => (
                  <li key={a.id} className="flex justify-between py-2">
                    <span className="text-on-surface">{formatDateTimeEAT(a.scheduledAt)}</span>
                    <span className="text-on-surface-variant">
                      {a.therapistName} · {humanizeEnum(a.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session notes</CardTitle>
          </CardHeader>
          <CardContent>
            {!notes || notes.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                Your therapist’s finalized notes will appear here.
              </p>
            ) : (
              <div className="space-y-4">
                {notes.map((n) => (
                  <div key={n.id} className="rounded-md border border-outline-variant p-4 text-sm">
                    <p className="mb-2 font-medium text-on-surface">
                      {n.scheduledAt ? formatDate(n.scheduledAt) : 'Session note'}
                    </p>
                    {[
                      ['Subjective', n.subjective],
                      ['Objective', n.objective],
                      ['Assessment', n.assessment],
                      ['Plan', n.plan],
                    ].map(([l, v]) =>
                      v ? (
                        <p key={l as string} className="text-on-surface-variant">
                          <strong className="text-on-surface">{l}:</strong> {v as string}
                        </p>
                      ) : null,
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
