'use client';

import '@/app/globals.css';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TerminalCard, TerminalLine } from '@/components/ui/terminal-card';
import { logger } from '@/lib/logger';
import { resolveDisplayErrorMessage } from '@/lib/ui-error';

const COPY = {
  tr: {
    title: 'Kritik bir hata oluştu',
    file: '~/global-error.log',
    comment: '// Kök layout veya uygulama çöktü',
    safeMessage:
      'Uygulama şu anda yüklenemedi. Lütfen kısa süre sonra tekrar deneyin.',
    try: 'Tekrar Deneyin...',
    back: 'Ana Sayfaya Geri Dön',
  },
  en: {
    title: 'A critical error occurred',
    file: '~/global-error.log',
    comment: '// Root layout or application crashed',
    safeMessage:
      'The application could not be loaded right now. Please try again shortly.',
    try: 'Try again...',
    back: 'Back to home',
  },
} as const;

type LocaleKey = keyof typeof COPY;

function resolveLocale(): LocaleKey {
  if (typeof document === 'undefined') {
    return 'tr';
  }
  const lang = document.documentElement.lang?.toLowerCase() ?? '';
  return lang.startsWith('en') ? 'en' : 'tr';
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = resolveLocale();
  const t = COPY[locale];
  const showDigest = process.env.NODE_ENV === 'development' && error.digest;
  const displayMessage = resolveDisplayErrorMessage(
    error.message,
    t.safeMessage,
  );

  useEffect(() => {
    logger.error('Unhandled global error boundary', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="mesh-background font-sans" suppressHydrationWarning>
        <main className="grid min-h-screen place-content-center px-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>

            <TerminalCard fileName={t.file} className="text-left">
              <div className="space-y-1.5 font-mono text-[13px] leading-relaxed text-slate-200">
                <p>
                  <span className="text-teal-400">try</span> {'{'}
                </p>
                <p className="pl-4 text-slate-400">bootstrap(app);</p>
                <p>
                  {'}'} <span className="text-teal-400">catch</span>{' '}
                  <span className="text-slate-400">(error)</span> {'{'}
                </p>
                <p className="pl-4 text-slate-500">{t.comment}</p>
                <TerminalLine prompt="" className="pl-4 text-red-300/90">
                  {displayMessage}
                </TerminalLine>
                {showDigest ? (
                  <TerminalLine prompt="" className="pl-4 text-slate-500">
                    digest: {error.digest}
                  </TerminalLine>
                ) : null}
                <p>{'}'}</p>
              </div>
            </TerminalCard>

            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => reset()} variant="accent" className="font-semibold">
                {t.try}
              </Button>
              <Button asChild variant="secondary" className="font-semibold">
                <a href="/">{t.back}</a>
              </Button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
