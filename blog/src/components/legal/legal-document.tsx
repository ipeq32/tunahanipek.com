import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import { ArrowRight, FileText, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type LegalSection = {
  key: string;
  title: string;
  body: string;
  icon: LucideIcon;
};

type LegalDocumentProps = {
  variant: 'privacy' | 'terms';
  title: string;
  description: string;
  badge: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  tocTitle: string;
  sections: LegalSection[];
  questionsTitle: string;
  questionsDescription: string;
  contactCta: string;
  relatedTitle: string;
  relatedDescription: string;
  relatedHref: '/privacy' | '/terms';
  relatedLabel: string;
};

const VARIANT_META = {
  privacy: {
    icon: Shield,
    gradient: 'from-teal-500/15 via-cyan-500/10 to-transparent',
    accent: 'text-teal-600 dark:text-teal-400',
  },
  terms: {
    icon: FileText,
    gradient: 'from-sky-500/15 via-indigo-500/10 to-transparent',
    accent: 'text-sky-600 dark:text-sky-400',
  },
} as const;

export function LegalDocument({
  variant,
  title,
  description,
  badge,
  lastUpdatedLabel,
  lastUpdated,
  tocTitle,
  sections,
  questionsTitle,
  questionsDescription,
  contactCta,
  relatedTitle,
  relatedDescription,
  relatedHref,
  relatedLabel,
}: LegalDocumentProps) {
  const meta = VARIANT_META[variant];
  const HeroIcon = meta.icon;

  return (
    <>
      <HeaderTemplate title={title} description={description} />

      <div className="mt-2 space-y-8">
        <section
          className={cn(
            'relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br p-6 md:p-8',
            meta.gradient,
          )}
        >
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background/80 shadow-sm',
                  meta.accent,
                )}
              >
                <HeroIcon className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <span className="inline-flex items-center rounded-full border border-teal-500/25 bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-300">
                  {badge}
                </span>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    {lastUpdatedLabel}:
                  </span>{' '}
                  {lastUpdated}
                </p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-right">
              {description}
            </p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,13rem)_1fr] lg:gap-10">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav
              aria-label={tocTitle}
              className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tocTitle}
              </p>
              <ol className="space-y-1">
                {sections.map((section, index) => (
                  <li key={section.key}>
                    <a
                      href={`#${section.key}`}
                      className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-teal-500/10 hover:text-foreground"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted/80 text-[10px] font-semibold tabular-nums text-muted-foreground group-hover:bg-teal-500/15 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                        {index + 1}
                      </span>
                      <span className="line-clamp-2">{section.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="space-y-5">
            {sections.map((section, index) => {
              const Icon = section.icon;

              return (
                <article
                  key={section.key}
                  id={section.key}
                  className="scroll-mt-24 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-colors hover:border-border md:p-7"
                >
                  <div className="mb-4 flex items-start gap-3">
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10',
                        meta.accent,
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
                        {section.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem] md:leading-7">
                    {section.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent p-6 md:p-7">
            <h3 className="text-base font-semibold tracking-tight">
              {questionsTitle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {questionsDescription}
            </p>
            <Button variant="accent" size="sm" className="mt-4" asChild>
              <Link href="/contact">
                {contactCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-muted/30 p-6 md:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {relatedTitle}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {relatedDescription}
              </p>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-fit" asChild>
              <Link href={relatedHref}>
                {relatedLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
