import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type ContentCardProps = {
  children: ReactNode;
  className?: string;
};

export function ContentCard({ children, className }: ContentCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm md:p-8',
        className
      )}
    >
      {children}
    </div>
  );
}
