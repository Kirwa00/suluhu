'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { changePasswordSchema, type ChangePasswordInput } from '@suluhu/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PageHeading } from '@/components/app/stat-card';
import { ApiClientError } from '@/lib/api-client';
import { usersApi } from '@/lib/api/users-api';
import { humanizeEnum } from '@/lib/format';
import { useT } from '@/i18n/locale-context';
import type { MessageKey } from '@/i18n/dictionaries';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-outline-variant py-3 last:border-0">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-sm font-medium text-on-surface">{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  const t = useT();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.getProfile(),
  });

  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const onChangePassword = form.handleSubmit(async (values) => {
    setPwError(null);
    setPwSuccess(false);
    try {
      await usersApi.changePassword(values.currentPassword, values.newPassword);
      setPwSuccess(true);
      form.reset();
    } catch (err) {
      setPwError(err instanceof ApiClientError ? err.message : t('settings.password.error'));
    }
  });

  return (
    <div className="max-w-3xl">
      <PageHeading title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('settings.profile.title')}</CardTitle>
          <CardDescription>{t('settings.profile.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !profile ? (
            <p className="text-sm text-on-surface-variant">{t('common.loading')}</p>
          ) : (
            <div>
              <Row
                label={t('settings.profile.name')}
                value={`${profile.firstName} ${profile.lastName}`.trim() || '—'}
              />
              <Row label={t('settings.profile.email')} value={profile.email} />
              <Row label={t('settings.profile.phone')} value={profile.phone} />
              <Row
                label={t('settings.profile.role')}
                value={t(`role.${profile.role}` as MessageKey)}
              />
              <Row
                label={t('settings.profile.accountStatus')}
                value={humanizeEnum(profile.status)}
              />
              <Row
                label={t('settings.profile.phoneVerified')}
                value={profile.phoneVerified ? t('settings.profile.yes') : t('settings.profile.no')}
              />
              <Row
                label={t('settings.profile.mfa')}
                value={
                  profile.mfaEnabled
                    ? t('settings.profile.enabled')
                    : t('settings.profile.disabled')
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.password.title')}</CardTitle>
          <CardDescription>{t('settings.password.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pwError && <Alert variant="error">{pwError}</Alert>}
          {pwSuccess && <Alert variant="success">{t('settings.password.success')}</Alert>}
          <form onSubmit={onChangePassword} className="space-y-4" noValidate>
            <Field
              label={t('settings.password.current')}
              htmlFor="currentPassword"
              error={form.formState.errors.currentPassword?.message}
            >
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...form.register('currentPassword')}
              />
            </Field>
            <Field
              label={t('settings.password.new')}
              htmlFor="newPassword"
              error={form.formState.errors.newPassword?.message}
              hint={t('settings.password.newHint')}
            >
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...form.register('newPassword')}
              />
            </Field>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? t('settings.password.updating')
                : t('settings.password.update')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
