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
        'group flex items-start gap-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-all',
        'hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-md hover:shadow-teal-500/10'
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-medium text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400">
          {value}
        </p>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-500" />
    </NextLink>
  );
}
