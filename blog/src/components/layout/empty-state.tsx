import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { FileQuestion, type LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: '/' | '/blog';
  icon?: LucideIcon;
  children?: ReactNode;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref = '/',
  icon: Icon = FileQuestion,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/40 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {children}
      {actionLabel && (
        <Button variant="accent" className="mt-6" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
