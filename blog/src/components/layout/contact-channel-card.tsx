import { cn } from '@/lib/utils';
import { ArrowUpRight, LucideIcon } from 'lucide-react';
import NextLink from 'next/link';

type ContactChannelCardProps = {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
};

export function ContactChannelCard({
  label,
  value,
  href,
  icon: Icon,
  external = true,
}: ContactChannelCardProps) {
  return (
    <NextLink
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className={cn(
        'group flex items-center gap-3.5 rounded-xl border border-border/60 bg-background/50 p-4 transition-all',
        'hover:border-teal-500/30 hover:bg-teal-500/[0.03] hover:shadow-sm hover:shadow-teal-500/5'
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/10 transition-colors group-hover:bg-teal-500/15 dark:text-teal-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400">
          {value}
        </p>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-all group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-teal-500" />
    </NextLink>
  );
}
