'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { requestPasswordResetSchema, type RequestPasswordResetInput } from '@suluhu/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/auth/auth-api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    // Always succeeds from the user's view (no account enumeration).
    await authApi.forgotPassword(email).catch(() => undefined);
    setSubmitted(true);
    setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}`), 1200);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we’ll send a code to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {submitted && (
          <Alert variant="success">
            If an account exists for that email, a reset code is on its way.
          </Alert>
        )}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          </Field>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Sending…' : 'Send reset code'}
          </Button>
        </form>
        <p className="text-center text-sm text-on-surface-variant">
          <Link href="/login" className="font-medium text-secondary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
