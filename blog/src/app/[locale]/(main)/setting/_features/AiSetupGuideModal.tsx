'use client';

import { CircleHelp, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type AiProvider = 'gemini' | 'groq' | 'ollama';

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

export default function AiSetupGuideModal({
  activeProvider = 'gemini',
}: AiSetupGuideModalProps) {
  const t = useTranslations('Settings.Ai.Guide');
  const [tab, setTab] = useState<AiProvider>(activeProvider);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <CircleHelp className="h-4 w-4" />
          {t('openButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-card/60 p-1">
          {PROVIDERS.map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => setTab(provider)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors',
                tab === provider
                  ? 'bg-violet-500/15 text-violet-700 dark:text-violet-300'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(`providers.${provider}`)}
            </button>
          ))}
        </div>

        <ol className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
          {[1, 2, 3, 4, 5].map((step) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xs font-semibold text-violet-700 dark:text-violet-300">
                {step}
              </span>
              <span>{t(`steps.${tab}.step${step}`)}</span>
            </li>
          ))}
        </ol>

        {tab === 'ollama' && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t('ollamaCommandsTitle')}
            </p>
            <pre className="overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-xs">
              ollama pull llama3.2{'\n'}ollama serve
            </pre>
          </div>
        )}

        <div className="mt-4 space-y-2">
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
        </div>

        <p className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-sm text-muted-foreground">
          {t(`tips.${tab}`)}
        </p>
      </DialogContent>
    </Dialog>
  );
}
