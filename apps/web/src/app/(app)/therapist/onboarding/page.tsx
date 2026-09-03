'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Gender,
  SPOKEN_LANGUAGES,
  THERAPY_SPECIALTIES,
  submitCredentialsSchema,
  type SubmitCredentialsInput,
} from '@suluhu/shared';
import { CheckCircle2, Circle } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageHeading } from '@/components/app/stat-card';
import { ApiClientError } from '@/lib/api-client';
import { therapistsApi } from '@/lib/api/therapists-api';
import { humanizeEnum } from '@/lib/format';
import { useT } from '@/i18n/locale-context';

const statusTone: Record<string, 'info' | 'success' | 'error'> = {
  PENDING: 'info',
  IN_REVIEW: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
  SUSPENDED: 'error',
};

export default function TherapistOnboardingPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data: status } = useQuery({
    queryKey: ['onboarding'],
    queryFn: () => therapistsApi.getOnboarding(),
  });

  const form = useForm<SubmitCredentialsInput>({
    resolver: zodResolver(submitCredentialsSchema),
    defaultValues: {
      cpbLicenseNumber: '',
      cpbExpiry: '',
      title: '',
      gender: Gender.PREFER_NOT_TO_SAY,
      bio: '',
      specialties: [],
      languages: [],
      yearsExperience: 0,
      sessionRateKsh: 2000,
    },
  });

  // Preselect English by default for convenience.
  useEffect(() => {
    if (form.getValues('languages').length === 0) form.setValue('languages', ['English']);
  }, [form]);

  const mutation = useMutation({
    mutationFn: (values: SubmitCredentialsInput) => therapistsApi.submitCredentials(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] }),
  });

  const specialties = form.watch('specialties');
  const languages = form.watch('languages');

  const toggle = (field: 'specialties' | 'languages', value: string) => {
    const current = form.getValues(field);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    form.setValue(field, next, { shouldValidate: true });
  };

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values));
  const e = form.formState.errors;
  const submitError = mutation.error instanceof ApiClientError ? mutation.error.message : null;

  return (
    <div className="max-w-3xl">
      <PageHeading title={t('onboarding.title')} subtitle={t('onboarding.subtitle')} />

      {status && (
        <Alert variant={statusTone[status.verificationStatus] ?? 'info'} className="mb-6">
          <p className="font-medium">
            {t('onboarding.status', { status: humanizeEnum(status.verificationStatus) })}
          </p>
          {status.rejectionReason && (
            <p>{t('onboarding.reason', { reason: status.rejectionReason })}</p>
          )}
          {status.cpbCheck && (
            <p>
              {t('onboarding.cpbCheck.line', {
                result: status.cpbCheck.valid
                  ? t('onboarding.cpbCheck.valid')
                  : t('onboarding.cpbCheck.notValid'),
                status: status.cpbCheck.status,
              })}
            </p>
          )}
          <ul className="mt-2 space-y-1">
            {[
              [
                t('onboarding.checklist.credentialsSubmitted'),
                status.checklist.credentialsSubmitted,
              ],
              [t('onboarding.checklist.cpbChecked'), status.checklist.cpbChecked],
              [t('onboarding.checklist.availabilitySet'), status.checklist.availabilitySet],
              [t('onboarding.checklist.approved'), status.checklist.approved],
            ].map(([label, done]) => (
              <li key={label as string} className="flex items-center gap-2">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-success-calm" aria-hidden />
                ) : (
                  <Circle className="h-4 w-4 opacity-50" aria-hidden />
                )}
                {label as string}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('onboarding.details.title')}</CardTitle>
          <CardDescription>{t('onboarding.details.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitError && <Alert variant="error">{submitError}</Alert>}
          {mutation.isSuccess && <Alert variant="success">{t('onboarding.submitted')}</Alert>}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('onboarding.field.title')} htmlFor="title" error={e.title?.message}>
                <Input
                  id="title"
                  placeholder="Counselling Psychologist"
                  {...form.register('title')}
                />
              </Field>
              <Field
                label={t('onboarding.field.gender')}
                htmlFor="gender"
                error={e.gender?.message}
              >
                <Select id="gender" {...form.register('gender')}>
                  {Object.values(Gender).map((g) => (
                    <option key={g} value={g}>
                      {humanizeEnum(g)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t('onboarding.field.cpbLicense')}
                htmlFor="cpb"
                error={e.cpbLicenseNumber?.message}
                hint={t('onboarding.field.cpbLicenseHint')}
              >
                <Input
                  id="cpb"
                  placeholder="CPB/2024/0002"
                  {...form.register('cpbLicenseNumber')}
                />
              </Field>
              <Field
                label={t('onboarding.field.cpbExpiry')}
                htmlFor="cpbExpiry"
                error={e.cpbExpiry?.message}
              >
                <Input id="cpbExpiry" type="date" {...form.register('cpbExpiry')} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t('onboarding.field.yearsExperience')}
                htmlFor="years"
                error={e.yearsExperience?.message}
              >
                <Input id="years" type="number" min={0} {...form.register('yearsExperience')} />
              </Field>
              <Field
                label={t('onboarding.field.sessionRate')}
                htmlFor="rate"
                error={e.sessionRateKsh?.message}
                hint={t('onboarding.field.sessionRateHint')}
              >
                <Input
                  id="rate"
                  type="number"
                  min={1000}
                  max={5000}
                  {...form.register('sessionRateKsh')}
                />
              </Field>
            </div>

            <Field
              label={t('onboarding.field.bio')}
              htmlFor="bio"
              error={e.bio?.message}
              hint={t('onboarding.field.bioHint')}
            >
              <Textarea id="bio" rows={5} {...form.register('bio')} />
            </Field>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-on-surface">
                {t('onboarding.specialties')}
              </legend>
              <div className="flex flex-wrap gap-2">
                {THERAPY_SPECIALTIES.map((s) => {
                  const active = specialties.includes(s);
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggle('specialties', s)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        active
                          ? 'border-secondary bg-secondary-container/50 text-on-secondary-container'
                          : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {humanizeEnum(s)}
                    </button>
                  );
                })}
              </div>
              {e.specialties && (
                <p className="mt-1 text-xs text-destructive">{e.specialties.message}</p>
              )}
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-on-surface">
                {t('onboarding.languages')}
              </legend>
              <div className="flex flex-wrap gap-2">
                {SPOKEN_LANGUAGES.map((l) => {
                  const active = languages.includes(l);
                  return (
                    <button
                      type="button"
                      key={l}
                      onClick={() => toggle('languages', l)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        active
                          ? 'border-secondary bg-secondary-container/50 text-on-secondary-container'
                          : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
              {e.languages && (
                <p className="mt-1 text-xs text-destructive">{e.languages.message}</p>
              )}
            </fieldset>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t('onboarding.submitting') : t('onboarding.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
