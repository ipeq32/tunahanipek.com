import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function AdminListCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm md:p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

type AdminStatusBadgeProps = {
  published: boolean;
  publishedLabel: string;
  draftLabel: string;
};

export function AdminStatusBadge({
  published,
  publishedLabel,
  draftLabel,
}: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        published
          ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
      )}
    >
      {published ? publishedLabel : draftLabel}
    </span>
  );
}

export function AdminListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="mt-6 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/60 bg-card/50 p-4 space-y-3"
        >
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminEmptyState({ message }: { message: string }) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground/60" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
