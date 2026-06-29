import { type HTMLAttributes } from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'info' | 'success' | 'error';

const styles: Record<Variant, string> = {
  info: 'border-tertiary/30 bg-accent-teal-light text-tertiary',
  success: 'border-success-calm/30 bg-secondary-container/40 text-on-secondary-container',
  error: 'border-destructive/30 bg-error-container text-on-error-container',
};

const icons = { info: Info, success: CheckCircle2, error: AlertTriangle };

export function Alert({
  variant = 'info',
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  const Icon = icons[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-md border p-3 text-sm', styles[variant], className)}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
