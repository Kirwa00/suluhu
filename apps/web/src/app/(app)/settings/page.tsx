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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-outline-variant py-3 last:border-0">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-sm font-medium text-on-surface">{value}</span>
    </div>
  );
}

export default function SettingsPage() {
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
      setPwError(err instanceof ApiClientError ? err.message : 'Could not change password.');
    }
  });

  return (
    <div className="max-w-3xl">
      <PageHeading title="Settings" subtitle="Manage your account and security." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !profile ? (
            <p className="text-sm text-on-surface-variant">Loading…</p>
          ) : (
            <div>
              <Row label="Name" value={`${profile.firstName} ${profile.lastName}`.trim() || '—'} />
              <Row label="Email" value={profile.email} />
              <Row label="Phone" value={profile.phone} />
              <Row label="Role" value={profile.role} />
              <Row label="Account status" value={profile.status} />
              <Row label="Phone verified" value={profile.phoneVerified ? 'Yes' : 'No'} />
              <Row label="Two-factor (MFA)" value={profile.mfaEnabled ? 'Enabled' : 'Disabled'} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>For your security, you’ll be signed out of other devices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pwError && <Alert variant="error">{pwError}</Alert>}
          {pwSuccess && <Alert variant="success">Password updated successfully.</Alert>}
          <form onSubmit={onChangePassword} className="space-y-4" noValidate>
            <Field
              label="Current password"
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
              label="New password"
              htmlFor="newPassword"
              error={form.formState.errors.newPassword?.message}
              hint="At least 8 characters with upper, lower and a number."
            >
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...form.register('newPassword')}
              />
            </Field>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
