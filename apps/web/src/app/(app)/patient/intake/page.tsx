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
import { useT } from '@/i18n/locale-context';
import type { MessageKey } from '@/i18n/dictionaries';

type Options = readonly { value: number; label: string }[];

const STEPS = [
  { key: 'intro' as const, titleKey: 'intake.step.welcome' as MessageKey },
  {
    key: 'phq9' as const,
    titleKey: 'intake.step.phq9' as MessageKey,
    preamble: PHQ9_PREAMBLE,
    questions: PHQ9_QUESTIONS,
    options: FREQUENCY_OPTIONS,
  },
  {
    key: 'gad7' as const,
    titleKey: 'intake.step.gad7' as MessageKey,
    preamble: GAD7_PREAMBLE,
    questions: GAD7_QUESTIONS,
    options: FREQUENCY_OPTIONS,
  },
  {
    key: 'cage' as const,
    titleKey: 'intake.step.cage' as MessageKey,
    preamble: CAGE_PREAMBLE,
    questions: CAGE_QUESTIONS,
    options: YES_NO_OPTIONS,
  },
];

export default function IntakePage() {
  const t = useT();
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
      setError(err instanceof ApiClientError ? err.message : t('intake.submitError')),
  });

  if (result) return <Results result={result} />;

  const current = STEPS[step]!;
  const answers = current.key === 'phq9' ? phq9 : current.key === 'gad7' ? gad7 : cage;
  const setAnswers = current.key === 'phq9' ? setPhq9 : current.key === 'gad7' ? setGad7 : setCage;
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
          {t('intake.step', { step: step + 1, total: STEPS.length })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t(current.titleKey)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          {current.key === 'intro' ? (
            <div className="space-y-4">
              <p className="text-on-surface-variant">{t('intake.intro.body')}</p>
              <div>
                <label
                  htmlFor="concern"
                  className="mb-1.5 block text-sm font-medium text-on-surface"
                >
                  {t('intake.intro.concernLabel')}{' '}
                  <span className="text-on-surface-variant">{t('intake.intro.optional')}</span>
                </label>
                <Textarea
                  id="concern"
                  rows={4}
                  placeholder={t('intake.intro.concernPlaceholder')}
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
              onChange={(i, v) => setAnswers((prev) => prev.map((a, idx) => (idx === i ? v : a)))}
            />
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submit.isPending}
            >
              {t('intake.back')}
            </Button>
            {isLast ? (
              <Button onClick={() => submit.mutate()} disabled={!allAnswered || submit.isPending}>
                {submit.isPending ? t('intake.submitting') : t('intake.seeResults')}
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!allAnswered}>
                {t('intake.continue')}
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
  const t = useT();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-on-surface">
        {t('intake.results.title')}
      </h1>

      {result.crisisFlag && result.crisisResources && (
        <Card className="border-safety-amber bg-tertiary-fixed/40">
          <CardContent className="space-y-3 pt-6">
            <p className="font-display text-lg font-semibold text-on-surface">
              {t('intake.results.crisis.title')}
            </p>
            <p className="text-on-surface-variant">{result.crisisResources.message}</p>
            <Button asChild variant="crisis" size="lg" className="w-full sm:w-auto">
              <a href={`tel:${result.crisisResources.hotline}`}>
                <Phone className="h-5 w-5" aria-hidden />
                {t('intake.results.crisis.call', { hotline: result.crisisResources.hotline })}
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('intake.results.heard.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.aiSummary && <p className="text-on-surface-variant">{result.aiSummary}</p>}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              [t('intake.results.depression'), result.phq9Score, 27],
              [t('intake.results.anxiety'), result.gad7Score, 21],
              [t('intake.results.alcohol'), result.cageScore, 4],
            ].map(([label, score, max]) => (
              <div key={label as string} className="rounded-md bg-surface-soothing p-3">
                <p className="font-display text-xl font-bold text-on-surface">
                  {score as number}
                  <span className="text-sm font-normal text-on-surface-variant">
                    /{max as number}
                  </span>
                </p>
                <p className="text-xs text-on-surface-variant">{label as string}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-on-surface-variant">
            {t('intake.results.overallLevelLabel')}{' '}
            <strong className="text-on-surface">{humanizeEnum(result.riskLevel)}</strong>.{' '}
            {t('intake.results.overallLevelBody')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('intake.results.recommended.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {result.matches.length === 0 ? (
            <p className="text-on-surface-variant">{t('intake.results.recommended.empty')}</p>
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
                      <Link href={`/patient/therapists/${m.id}/book`}>
                        {t('intake.results.book')}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link href="/patient/therapists" className="text-sm text-secondary hover:underline">
              {t('intake.results.browseAll')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
