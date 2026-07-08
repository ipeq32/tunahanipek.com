'use client';

import { SignatureLogo } from '@/components/ui/signature-logo';
import { cn } from '@/lib/utils';

type BrandLoaderProps = {
  ariaLabel: string;
  loop?: boolean;
  className?: string;
  logoClassName?: string;
};

export function BrandLoader({
  ariaLabel,
  loop = true,
  className,
  logoClassName,
}: BrandLoaderProps) {
  return (
    <div
      className={cn('preloader-content flex flex-col items-center', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <div className="relative flex items-center justify-center">
        <div
          className="pointer-events-none absolute inset-0 -z-10 scale-[1.65] rounded-full bg-gradient-to-br from-teal-500/25 via-sky-500/15 to-transparent blur-2xl dark:from-teal-400/20 dark:via-sky-400/15"
          aria-hidden
        />
        <SignatureLogo
          gradientId={loop ? 'loader-signature-loop' : 'loader-signature-once'}
          loopDraw={loop}
          className={cn(
            'loader-logo-emphasis h-32 w-32 sm:h-40 sm:w-40',
            logoClassName,
          )}
        />
      </div>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}
