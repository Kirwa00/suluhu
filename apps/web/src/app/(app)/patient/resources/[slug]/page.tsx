'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { contentApi } from '@/lib/api/engagement-api';

export default function ResourceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['content', slug],
    queryFn: () => contentApi.get(slug),
    enabled: Boolean(slug),
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/patient/resources" className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to resources
      </Link>
      {isLoading ? (
        <p className="mt-4 text-on-surface-variant">Loading…</p>
      ) : isError || !data ? (
        <Card className="mt-4 p-10 text-center text-on-surface-variant">Resource not found.</Card>
      ) : (
        <article className="mt-4">
          <p className="text-xs uppercase tracking-wide text-on-surface-variant">{data.category}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-on-surface">{data.title}</h1>
          <p className="mt-2 text-lg text-on-surface-variant">{data.summary}</p>
          <Card className="mt-6">
            <CardContent className="prose-suluhu whitespace-pre-line pt-6 text-on-surface">
              {data.body}
            </CardContent>
          </Card>
        </article>
      )}
    </div>
  );
}
