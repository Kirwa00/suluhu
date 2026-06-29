'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageHeading } from '@/components/app/stat-card';
import { ApiClientError } from '@/lib/api-client';
import { clinicalApi } from '@/lib/api/clinical-api';
import { formatDateTimeEAT, humanizeEnum } from '@/lib/format';

export default function ClientRecordPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [selectedAppt, setSelectedAppt] = useState<string | null>(null);

  const { data: record, isLoading } = useQuery({
    queryKey: ['record', patientId],
    queryFn: () => clinicalApi.healthRecord(patientId),
    enabled: Boolean(patientId),
  });

  if (isLoading || !record) return <p className="text-on-surface-variant">Loading record…</p>;

  return (
    <div className="max-w-4xl">
      <Link href="/therapist/clients" className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to clients
      </Link>
      <PageHeading title={record.patient.name} subtitle="Patient health record" />

      {record.openAlerts.length > 0 && (
        <Alert variant="error" className="mb-6">
          <p className="font-medium">{record.openAlerts.length} open clinical alert(s)</p>
          {record.openAlerts.map((a) => (
            <p key={a.id}>· {a.message}</p>
          ))}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Latest intake</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {record.latestIntake ? (
              <>
                <Row label="PHQ-9" value={`${record.latestIntake.phq9Score}/27`} />
                <Row label="GAD-7" value={`${record.latestIntake.gad7Score}/21`} />
                <Row label="CAGE" value={`${record.latestIntake.cageScore}/4`} />
                <Row label="Risk" value={humanizeEnum(record.latestIntake.riskLevel)} />
                {record.latestIntake.primaryConcern && (
                  <p className="pt-2 text-on-surface-variant">“{record.latestIntake.primaryConcern}”</p>
                )}
              </>
            ) : (
              <p className="text-on-surface-variant">No intake on record.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sessions &amp; notes</CardTitle>
            </CardHeader>
            <CardContent>
              {record.appointments.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No sessions yet.</p>
              ) : (
                <ul className="divide-y divide-outline-variant">
                  {record.appointments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-on-surface">
                          {formatDateTimeEAT(a.scheduledAt)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {a.durationMins} min · {humanizeEnum(a.status)}
                        </p>
                      </div>
                      <Button
                        variant={selectedAppt === a.id ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setSelectedAppt(a.id)}
                      >
                        {selectedAppt === a.id ? 'Editing' : 'SOAP note'}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {selectedAppt && <NoteEditor appointmentId={selectedAppt} />}

          <PlanEditor patientId={patientId} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface">{value}</span>
    </div>
  );
}

function NoteEditor({ appointmentId }: { appointmentId: string }) {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    riskAssessment: '',
  });
  const [status, setStatus] = useState('DRAFT');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: note } = useQuery({
    queryKey: ['note', appointmentId],
    queryFn: () => clinicalApi.noteByAppointment(appointmentId),
  });

  useEffect(() => {
    if (note) {
      setFields({
        subjective: note.subjective,
        objective: note.objective,
        assessment: note.assessment,
        plan: note.plan,
        riskAssessment: note.riskAssessment,
      });
      setStatus(note.status);
    } else {
      setFields({ subjective: '', objective: '', assessment: '', plan: '', riskAssessment: '' });
      setStatus('DRAFT');
    }
  }, [note, appointmentId]);

  const ai = useMutation({
    mutationFn: () => clinicalApi.aiDraft(appointmentId),
    onSuccess: (d) =>
      setFields({
        subjective: d.subjective,
        objective: d.objective,
        assessment: d.assessment,
        plan: d.plan,
        riskAssessment: d.riskAssessment,
      }),
  });

  const save = useMutation({
    mutationFn: (nextStatus: 'DRAFT' | 'FINALIZED') =>
      clinicalApi.upsertNote({ appointmentId, ...fields, status: nextStatus }),
    onSuccess: (n) => {
      setSaved(true);
      setError(null);
      setStatus(n.status);
      queryClient.invalidateQueries({ queryKey: ['note', appointmentId] });
    },
    onError: (err) => setError(err instanceof ApiClientError ? err.message : 'Could not save.'),
  });

  const set = (k: keyof typeof fields, v: string) => {
    setFields((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };
  const finalized = status === 'FINALIZED';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>SOAP note</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => ai.mutate()} disabled={ai.isPending || finalized}>
            <Sparkles className="h-4 w-4" aria-hidden />
            {ai.isPending ? 'Drafting…' : 'AI draft'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        {saved && <Alert variant="success">Note saved ({humanizeEnum(status)}).</Alert>}
        {finalized && <Alert variant="info">This note is finalized and locked.</Alert>}

        {(
          [
            ['subjective', 'Subjective'],
            ['objective', 'Objective'],
            ['assessment', 'Assessment'],
            ['plan', 'Plan'],
            ['riskAssessment', 'Risk assessment'],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="mb-1 block text-sm font-medium text-on-surface">{label}</label>
            <Textarea
              rows={key === 'riskAssessment' ? 2 : 3}
              value={fields[key]}
              onChange={(e) => set(key, e.target.value)}
              disabled={finalized}
            />
          </div>
        ))}

        {!finalized && (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => save.mutate('DRAFT')} disabled={save.isPending}>
              Save draft
            </Button>
            <Button onClick={() => save.mutate('FINALIZED')} disabled={save.isPending}>
              Finalize
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PlanEditor({ patientId }: { patientId: string }) {
  const queryClient = useQueryClient();
  const [goals, setGoals] = useState('');
  const [interventions, setInterventions] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: plan } = useQuery({
    queryKey: ['plan', patientId],
    queryFn: () => clinicalApi.getPlan(patientId),
  });

  useEffect(() => {
    if (plan) {
      setGoals(plan.goals.join('\n'));
      setInterventions(plan.interventions.join('\n'));
      setReviewDate(plan.reviewDate ? plan.reviewDate.slice(0, 10) : '');
      setStatus(plan.status);
      setSummary(plan.summary);
    }
  }, [plan]);

  const save = useMutation({
    mutationFn: () =>
      clinicalApi.upsertPlan({
        patientId,
        goals: goals.split('\n').map((g) => g.trim()).filter(Boolean),
        interventions: interventions.split('\n').map((g) => g.trim()).filter(Boolean),
        reviewDate: reviewDate || undefined,
        status: status as 'ACTIVE' | 'COMPLETED' | 'ARCHIVED',
        summary: summary || undefined,
      }),
    onSuccess: () => {
      setSaved(true);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['plan', patientId] });
      queryClient.invalidateQueries({ queryKey: ['record', patientId] });
    },
    onError: (err) => setError(err instanceof ApiClientError ? err.message : 'Could not save plan.'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treatment plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        {saved && <Alert variant="success">Treatment plan saved.</Alert>}
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface">Goals (one per line)</label>
          <Textarea rows={3} value={goals} onChange={(e) => setGoals(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface">
            Interventions (one per line)
          </label>
          <Textarea rows={3} value={interventions} onChange={(e) => setInterventions(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface">Review date</label>
            <Input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface">Status</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {['ACTIVE', 'COMPLETED', 'ARCHIVED'].map((s) => (
                <option key={s} value={s}>
                  {humanizeEnum(s)}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface">Summary (optional)</label>
          <Textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending || !goals.trim()}>
          {save.isPending ? 'Saving…' : 'Save treatment plan'}
        </Button>
      </CardContent>
    </Card>
  );
}
