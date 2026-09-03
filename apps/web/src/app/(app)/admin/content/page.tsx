'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CONTENT_TYPES, contentResourceSchema, type ContentResourceInput } from '@suluhu/shared';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageHeading } from '@/components/app/stat-card';
import { ApiClientError } from '@/lib/api-client';
import { contentApi } from '@/lib/api/engagement-api';
import { formatDate, humanizeEnum } from '@/lib/format';
import { useT } from '@/i18n/locale-context';

export default function AdminContentPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-content'], queryFn: () => contentApi.adminList() });

  const form = useForm<ContentResourceInput>({
    resolver: zodResolver(contentResourceSchema),
    defaultValues: {
      slug: '',
      title: '',
      summary: '',
      body: '',
      category: '',
      type: 'ARTICLE',
      language: 'en',
      published: true,
    },
  });

  const create = useMutation({
    mutationFn: (v: ContentResourceInput) => contentApi.create(v),
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });

  const e = form.formState.errors;
  const error = create.error instanceof ApiClientError ? create.error.message : null;

  return (
    <div className="max-w-3xl">
      <PageHeading title={t('content.title')} subtitle={t('content.subtitle')} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('content.new.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          {create.isSuccess && (
            <Alert variant="success" className="mb-4">
              {t('content.published')}
            </Alert>
          )}
          <form
            onSubmit={form.handleSubmit((v) => create.mutate(v))}
            className="space-y-4"
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('content.field.title')} htmlFor="title" error={e.title?.message}>
                <Input id="title" {...form.register('title')} />
              </Field>
              <Field
                label={t('content.field.slug')}
                htmlFor="slug"
                error={e.slug?.message}
                hint={t('content.field.slugHint')}
              >
                <Input id="slug" {...form.register('slug')} />
              </Field>
            </div>
            <Field label={t('content.field.summary')} htmlFor="summary" error={e.summary?.message}>
              <Input id="summary" {...form.register('summary')} />
            </Field>
            <Field label={t('content.field.body')} htmlFor="body" error={e.body?.message}>
              <Textarea id="body" rows={6} {...form.register('body')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label={t('content.field.category')}
                htmlFor="category"
                error={e.category?.message}
              >
                <Input id="category" placeholder="Anxiety" {...form.register('category')} />
              </Field>
              <Field label={t('content.field.type')} htmlFor="type">
                <Select id="type" {...form.register('type')}>
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {humanizeEnum(ct)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t('content.field.language')} htmlFor="language">
                <Select id="language" {...form.register('language')}>
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                </Select>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-on-surface">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#1b4f8c]"
                {...form.register('published')}
              />
              {t('content.publishNow')}
            </label>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? t('content.saving') : t('content.create')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('content.all.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.length === 0 ? (
            <p className="text-sm text-on-surface-variant">{t('content.all.empty')}</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {data.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-on-surface">{r.title}</p>
                    <p className="text-on-surface-variant">
                      {r.category} · {humanizeEnum(r.type)} · {formatDate(r.updatedAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      r.published
                        ? 'bg-secondary-container/50 text-on-secondary-container'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {r.published ? t('content.published.badge') : t('content.draft.badge')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
