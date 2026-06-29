'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, Dumbbell, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageHeading } from '@/components/app/stat-card';
import { contentApi } from '@/lib/api/engagement-api';

const typeIcon = { ARTICLE: BookOpen, VIDEO: PlayCircle, EXERCISE: Dumbbell } as const;

export default function ResourcesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['content'], queryFn: () => contentApi.list() });

  return (
    <div>
      <PageHeading
        title="Resources"
        subtitle="Self-help articles and exercises to support your wellbeing."
      />
      {isLoading ? (
        <p className="text-on-surface-variant">Loading…</p>
      ) : !data || data.length === 0 ? (
        <Card className="p-10 text-center text-on-surface-variant">No resources yet.</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((r) => {
            const Icon = typeIcon[r.type as keyof typeof typeIcon] ?? BookOpen;
            return (
              <Link key={r.id} href={`/patient/resources/${r.slug}`}>
                <Card className="h-full p-5 transition-shadow hover:shadow-ambient">
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent text-secondary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="text-xs uppercase tracking-wide text-on-surface-variant">{r.category}</p>
                  <h2 className="mt-1 font-display font-semibold text-on-surface">{r.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{r.summary}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
