import Image from 'next/image';
import { cn } from '@/lib/utils';

const SIZES = { sm: 20, md: 24, lg: 32 } as const;

/** Suluhu chain-link mark + wordmark, from the official logo. */
export function BrandLogo({
  size = 'md',
  wordmark = 'Suluhu Therapy Center',
  className,
}: {
  size?: keyof typeof SIZES;
  wordmark?: string;
  className?: string;
}) {
  const px = SIZES[size];
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Image
        src="/brand/mark.png"
        alt=""
        width={px}
        height={px}
        priority
        className="shrink-0"
      />
      {wordmark ? (
        <span className="font-display text-xl font-bold text-primary">{wordmark}</span>
      ) : null}
    </span>
  );
}
