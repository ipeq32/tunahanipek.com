import { cn } from '@/lib/utils';
import { ArrowUpRight, LucideIcon } from 'lucide-react';
import { Link } from '@/navigation';
import NextLink from 'next/link';
import { ComponentProps, ReactNode } from 'react';

type FeatureCardBase = {
  title: string;
  description: string;
  linkLabel: string;
  icon: LucideIcon;
  className?: string;
};

type FeatureCardProps = FeatureCardBase &
  (
    | { external: true; href: string }
    | { external?: false; internalHref: ComponentProps<typeof Link>['href'] }
  );

export function FeatureCard(props: FeatureCardProps) {
  const {
    title,
    description,
    linkLabel,
    icon: Icon,
    className,
    external = false,
  } = props;

  const linkContent = (
    <>
      {linkLabel}
      <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </>
  );

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10',
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal-500/10 blur-2xl transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative space-y-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {external && 'href' in props ? (
          <NextLink
            href={props.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm font-medium text-teal-600 transition-colors hover:text-teal-500 dark:text-teal-400"
          >
            {linkContent}
          </NextLink>
        ) : 'internalHref' in props ? (
          <Link
            href={props.internalHref}
            className="inline-flex items-center text-sm font-medium text-teal-600 transition-colors hover:text-teal-500 dark:text-teal-400"
          >
            {linkContent}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

type InfoRowProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function InfoRow({ label, value, className }: InfoRowProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/40 bg-background/50 px-4 py-3',
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}
