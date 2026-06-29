'use client';

import { useMutation } from '@tanstack/react-query';
import {
  CAGE_PREAMBLE,
  CAGE_QUESTIONS,
  FREQUENCY_OPTIONS,
  GAD7_PREAMBLE,
  GAD7_QUESTIONS,
  PHQ9_PREAMBLE,
  PHQ9_QUESTIONS,
  YES_NO_OPTIONS,
} from '@suluhu/shared';
import { Phone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ApiClientError } from '@/lib/api-client';
import { intakeApi, type IntakeResult } from '@/lib/api/intake-api';
import { formatKsh, humanizeEnum } from '@/lib/format';

type Options = readonly { value: number; label: string }[];

const STEPS = [
  { key: 'intro' as const, title: 'Welcome' },
  { key: 'phq9' as const, title: 'How you’ve been feeling', preamble: PHQ9_PREAMBLE, questions: PHQ9_QUESTIONS, options: FREQUENCY_OPTIONS },
  { key: 'gad7' as const, title: 'Worry & anxiety', preamble: GAD7_PREAMBLE, questions: GAD7_QUESTIONS, options: FREQUENCY_OPTIONS },
  { key: 'cage' as const, title: 'A few more questions', preamble: CAGE_PREAMBLE, questions: CAGE_QUESTIONS, options: YES_NO_OPTIONS },
];

export default function IntakePage() {
  const [step, setStep] = useState(0);
  const [concern, setConcern] = useState('');
  const [phq9, setPhq9] = useState<(number | null)[]>(Array(9).fill(null));
  const [gad7, setGad7] = useState<(number | null)[]>(Array(7).fill(null));
  const [cage, setCage] = useState<(number | null)[]>(Array(4).fill(null));
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: () =>
      intakeApi.submit({
        phq9Answers: phq9 as number[],
        gad7Answers: gad7 as number[],
        cageAnswers: cage as number[],
        primaryConcern: concern.trim() || undefined,
      }),
    onSuccess: (r) => setResult(r),
    onError: (err) =>
      setError(err instanceof ApiClientError ? err.message : 'Could not submit. Try again.'),
  });

  if (result) return <Results result={result} />;

  const current = STEPS[step]!;
  const answers = current.key === 'phq9' ? phq9 : current.key === 'gad7' ? gad7 : cage;
  const setAnswers =
    current.key === 'phq9' ? setPhq9 : current.key === 'gad7' ? setGad7 : setCage;
  const allAnswered = current.key === 'intro' || answers.every((a) => a !== null);
  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-container">
          <div
            className="h-full rounded-full bg-tertiary transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-on-surface-variant">
          Step {step + 1} of {STEPS.length} · Take your time, there are no wrong answers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{current.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          {current.key === 'intro' ? (
            <div className="space-y-4">
              <p className="text-on-surface-variant">
                This is a private, judgement-free check-in. Your answers help us understand how you’re
                doing and connect you with the right therapist. It takes about 3 minutes.
              </p>
              <div>
                <label htmlFor="concern" className="mb-1.5 block text-sm font-medium text-on-surface">
                  What’s brought you here today? <span className="text-on-surface-variant">(optional)</span>
                </label>
                <Textarea
                  id="concern"
                  rows={4}
                  placeholder="Share as much or as little as you like…"
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <QuestionGroup
              preamble={current.preamble!}
              questions={current.questions!}
              options={current.options as Options}
              answers={answers}
              onChange={(i, v) =>
                setAnswers((prev) => prev.map((a, idx) => (idx === i ? v : a)))
              }
            />
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submit.isPending}
            >
              Back
            </Button>
            {isLast ? (
              <Button onClick={() => submit.mutate()} disabled={!allAnswered || submit.isPending}>
                {submit.isPending ? 'Submitting…' : 'See my results'}
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!allAnswered}>
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionGroup({
  preamble,
  questions,
  options,
  answers,
  onChange,
}: {
  preamble: string;
  questions: readonly string[];
  options: Options;
  answers: (number | null)[];
  onChange: (index: number, value: number) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="font-medium text-on-surface">{preamble}</p>
      {questions.map((q, i) => (
        <fieldset key={i} className="rounded-md border border-outline-variant p-4">
          <legend className="px-1 text-sm text-on-surface">{q}</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={q}>
            {options.map((opt) => {
              const active = answers[i] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange(i, opt.value)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? 'border-tertiary bg-accent-teal-light text-tertiary'
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function Results({ result }: { result: IntakeResult }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-on-surface">Your check-in results</h1>

      {result.crisisFlag && result.crisisResources && (
        <Card className="border-safety-amber bg-tertiary-fixed/40">
          <CardContent className="space-y-3 pt-6">
            <p className="font-display text-lg font-semibold text-on-surface">
              You don’t have to face this alone
            </p>
            <p className="text-on-surface-variant">{result.crisisResources.message}</p>
            <Button asChild variant="crisis" size="lg" className="w-full sm:w-auto">
              <a href={`tel:${result.crisisResources.hotline}`}>
                <Phone className="h-5 w-5" aria-hidden />
                Call Befrienders Kenya now ({result.crisisResources.hotline})
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>What we heard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.aiSummary && <p className="text-on-surface-variant">{result.aiSummary}</p>}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ['Depression (PHQ-9)', result.phq9Score, 27],
              ['Anxiety (GAD-7)', result.gad7Score, 21],
              ['Alcohol (CAGE)', result.cageScore, 4],
            ].map(([label, score, max]) => (
              <div key={label as string} className="rounded-md bg-surface-soothing p-3">
                <p className="font-display text-xl font-bold text-on-surface">
                  {score as number}
                  <span className="text-sm font-normal text-on-surface-variant">/{max as number}</span>
                </p>
                <p className="text-xs text-on-surface-variant">{label as string}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-on-surface-variant">
            Overall level: <strong className="text-on-surface">{humanizeEnum(result.riskLevel)}</strong>.
            This is a screening, not a diagnosis — your therapist will explore it with you.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended therapists</CardTitle>
        </CardHeader>
        <CardContent>
          {result.matches.length === 0 ? (
            <p className="text-on-surface-variant">
              We’ll match you with a therapist shortly. You can also browse all therapists.
            </p>
          ) : (
            <div className="space-y-3">
              {result.matches.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-outline-variant p-3"
                >
                  <div>
                    <p className="font-medium text-on-surface">{m.name}</p>
                    <p className="text-sm text-on-surface-variant">
                      {m.title} · {m.specialties.slice(0, 2).map(humanizeEnum).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-on-surface">
                      {formatKsh(m.sessionRateKsh)}
                    </span>
                    <Button asChild size="sm">
                      <Link href={`/patient/therapists/${m.id}/book`}>Book</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link href="/patient/therapists" className="text-sm text-secondary hover:underline">
              Browse all therapists →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
