'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, UserRole, type RegisterInput } from '@suluhu/shared';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authApi, ApiClientError } from '@/lib/auth/auth-api';
import { useAuth } from '@/lib/auth/auth-context';

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setSession } = useAuth();
  const isTherapist = params.get('role') === 'therapist';
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: isTherapist ? UserRole.THERAPIST : UserRole.PATIENT,
      locale: 'en',
      acceptedTerms: true as unknown as RegisterInput['acceptedTerms'],
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await authApi.register(values);
      setSession(result.user, result.tokens);
      router.replace('/verify');
    } catch (err) {
      if (err instanceof ApiClientError && err.details) {
        for (const [field, messages] of Object.entries(err.details)) {
          form.setError(field as keyof RegisterInput, { message: messages[0] });
        }
      }
      setFormError(
        err instanceof ApiClientError ? err.message : 'Unable to create account. Try again.',
      );
    }
  });

  const e = form.formState.errors;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {isTherapist ? 'Join as a therapist' : 'Create your account'}
        </CardTitle>
        <CardDescription>
          {isTherapist
            ? 'Start onboarding. You’ll verify your CPB license after sign-up.'
            : 'A few details to get you matched with the right therapist.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formError && <Alert variant="error">{formError}</Alert>}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" htmlFor="firstName" error={e.firstName?.message}>
              <Input id="firstName" autoComplete="given-name" {...form.register('firstName')} />
            </Field>
            <Field label="Last name" htmlFor="lastName" error={e.lastName?.message}>
              <Input id="lastName" autoComplete="family-name" {...form.register('lastName')} />
            </Field>
          </div>
          <Field label="Email" htmlFor="email" error={e.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          </Field>
          <Field
            label="Phone"
            htmlFor="phone"
            error={e.phone?.message}
            hint="Kenyan number, e.g. 0712 345 678"
          >
            <Input id="phone" type="tel" autoComplete="tel" {...form.register('phone')} />
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            error={e.password?.message}
            hint="At least 8 characters with upper, lower and a number."
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...form.register('password')}
            />
          </Field>

          <label className="flex items-start gap-2 text-sm text-on-surface-variant">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-input accent-[#1b4f8c]"
              {...form.register('acceptedTerms')}
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" className="text-secondary hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-secondary hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {e.acceptedTerms && (
            <p className="text-xs font-medium text-destructive">{e.acceptedTerms.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-secondary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
