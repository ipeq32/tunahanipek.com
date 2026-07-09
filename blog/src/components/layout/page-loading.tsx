import { BrandLoader } from '@/components/loading/brand-loader';
import { cn } from '@/lib/utils';

type PageLoadingProps = {
  ariaLabel: string;
  variant?: 'page' | 'inline';
  className?: string;
};

export function PageLoading({
  ariaLabel,
  variant = 'page',
  className,
}: PageLoadingProps) {
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex min-h-[12rem] w-full flex-col items-center justify-center py-8',
          className,
        )}
      >
        <BrandLoader
          ariaLabel={ariaLabel}
          loop
          logoClassName="h-24 w-24 sm:h-28 sm:w-28"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[120] flex items-center justify-center px-4',
        'bg-background/75 backdrop-blur-[6px]',
        'dark:bg-background/80',
        className,
      )}
      aria-hidden={false}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,hsl(var(--accent)/0.12),transparent_65%)] dark:bg-[radial-gradient(circle_at_50%_40%,hsl(199_89%_48%/0.14),transparent_65%)]"
        aria-hidden
      />
      <BrandLoader ariaLabel={ariaLabel} loop />
    </div>
  );
}
