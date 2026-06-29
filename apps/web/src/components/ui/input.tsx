import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Input — Suluhu design language (DESIGN.md §Input Fields): soft surface
 * background (not white), 8px radius, calm 2px focus ring in the action accent.
 */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-11 w-full rounded border border-input bg-surface-soothing px-3 py-2 text-base text-on-surface',
          'placeholder:text-on-surface-variant/60',
          'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
