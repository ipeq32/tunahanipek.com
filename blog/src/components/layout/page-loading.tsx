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
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center',
        variant === 'page'
          ? 'min-h-[min(100dvh-10rem,48rem)] flex-1 flex-col px-4 py-16'
          : 'min-h-[12rem] flex-col py-8',
        className,
      )}
    >
      <BrandLoader
        ariaLabel={ariaLabel}
        loop
        logoClassName={
          variant === 'inline' ? 'h-24 w-24 sm:h-28 sm:w-28' : undefined
        }
      />
    </div>
  );
}
