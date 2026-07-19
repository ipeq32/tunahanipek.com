'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { TerminalCard, TerminalLine } from '@/components/ui/terminal-card';
import { DidYouKnow } from '@/components/ui/did-you-know';
import { logUiError, resolveDisplayErrorMessage } from '@/lib/ui-error';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error.Main.Error');
  const displayMessage = resolveDisplayErrorMessage(
    error.message,
    t('safeMessage'),
  );

  useEffect(() => {
    logUiError('Unhandled UI error boundary', error);
  }, [error]);

  return (
    <main className="mesh-background grid min-h-screen place-content-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>

        <TerminalCard fileName={t('file')} className="text-left">
          <div className="space-y-1.5 font-mono text-[13px] leading-relaxed text-slate-200">
            <p>
              <span className="text-teal-400">try</span> {'{'}
            </p>
            <p className="pl-4 text-slate-400">render(page);</p>
            <p>
              {'}'} <span className="text-teal-400">catch</span>{' '}
              <span className="text-slate-400">(error)</span> {'{'}
            </p>
            <p className="pl-4 text-slate-500">{t('comment')}</p>
            <TerminalLine prompt="" className="pl-4 text-red-300/90">
              {displayMessage}
            </TerminalLine>
            <p>{'}'}</p>
          </div>
        </TerminalCard>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()} variant="accent" className="font-semibold">
            {t('Button.try')}
          </Button>
          <Button asChild variant="secondary" className="font-semibold">
            <a href="/">{t('Button.back')}</a>
          </Button>
        </div>

        <DidYouKnow variant="inline" className="pt-2" />
      </div>
    </main>
  );
}
