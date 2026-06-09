'use client';

import {
  CircleHelp,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type AiProvider = 'gemini' | 'groq' | 'ollama';

type GuideStep = {
  title: string;
  body: string;
};

type AiSetupGuideModalProps = {
  activeProvider?: AiProvider;
};

const PROVIDERS: AiProvider[] = ['gemini', 'groq', 'ollama'];

const GUIDE_LINKS: Record<
  AiProvider,
  Array<{ href: string; labelKey: string }>
> = {
  gemini: [
    {
      href: 'https://aistudio.google.com/apikey',
      labelKey: 'links.geminiApiKey',
    },
    {
      href: 'https://ai.google.dev/pricing',
      labelKey: 'links.geminiPricing',
    },
  ],
  groq: [
    {
      href: 'https://console.groq.com/keys',
      labelKey: 'links.groqApiKey',
    },
    {
      href: 'https://console.groq.com/docs/quickstart',
      labelKey: 'links.groqDocs',
    },
  ],
  ollama: [
    {
      href: 'https://ollama.com/download',
      labelKey: 'links.ollamaDownload',
    },
    {
      href: 'https://ollama.com/library',
      labelKey: 'links.ollamaModels',
    },
  ],
};

const OLLAMA_COMMANDS = [
  'ollama pull llama3.2',
  'ollama serve',
  'curl http://localhost:11434/api/tags',
] as const;

export default function AiSetupGuideModal({
  activeProvider = 'gemini',
}: AiSetupGuideModalProps) {
  const t = useTranslations('Settings.Ai.Guide');
  const [tab, setTab] = useState<AiProvider>(activeProvider);
  const rawSteps = t.raw(`steps.${tab}.items`);
  const steps = Array.isArray(rawSteps) ? (rawSteps as GuideStep[]) : [];

  useEffect(() => {
    setTab(activeProvider);
  }, [activeProvider]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <CircleHelp className="h-4 w-4" />
          {t('openButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {t('subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-card/60 p-1"
          role="tablist"
          aria-label={t('providerTabsLabel')}
        >
          {PROVIDERS.map((provider) => (
            <button
              key={provider}
              type="button"
              role="tab"
              aria-selected={tab === provider}
              onClick={() => setTab(provider)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors',
                tab === provider
                  ? 'bg-violet-500/15 text-violet-700 dark:text-violet-300'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(`providers.${provider}`)}
            </button>
          ))}
        </div>

        <section className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
            {t('overviewTitle')}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {t(`overviews.${tab}`)}
          </p>
          <div className="mt-3 rounded-lg border border-border/50 bg-background/70 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t('recommendedTitle')}
            </p>
            <p className="mt-1 font-mono text-xs text-foreground">
              {t(`recommended.${tab}`)}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('stepsTitle')}
          </p>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li
                key={`${tab}-${index}`}
                className="rounded-lg border border-border/50 bg-card/40 px-3 py-3"
              >
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xs font-semibold text-violet-700 dark:text-violet-300">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {step.title}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {tab === 'ollama' && (
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('ollamaCommandsTitle')}
            </p>
            <pre className="overflow-x-auto rounded-lg border border-border/50 bg-muted px-3 py-2 font-mono text-xs leading-relaxed">
              {OLLAMA_COMMANDS.join('\n')}
            </pre>
          </section>
        )}

        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('linksTitle')}
          </p>
          <ul className="space-y-2">
            {GUIDE_LINKS[tab].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
                >
                  {t(link.labelKey)}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
            <ShieldCheck className="h-4 w-4" />
            {t('securityTitle')}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t('securityNote')}
          </p>
        </section>

        <p className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
          {t(`tips.${tab}`)}
        </p>
      </DialogContent>
    </Dialog>
  );
}
