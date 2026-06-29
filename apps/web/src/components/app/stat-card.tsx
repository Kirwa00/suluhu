import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** Calm KPI tile used across dashboards. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: 'neutral' | 'positive' | 'attention';
}) {
  const toneClasses = {
    neutral: 'bg-accent text-secondary',
    positive: 'bg-secondary-container/50 text-on-secondary-container',
    attention: 'bg-error-container/60 text-on-error-container',
  } as const;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-on-surface-variant">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-on-surface">{value}</p>
          {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
        </div>
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-md', toneClasses[tone])}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </Card>
  );
}

export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold text-on-surface">{title}</h1>
      {subtitle && <p className="mt-1 text-on-surface-variant">{subtitle}</p>}
    </div>
  );
}
