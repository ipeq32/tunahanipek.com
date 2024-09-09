'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error.Main.Error');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container grid min-h-screen place-content-center space-y-5 text-center bg-sky-50 dark:bg-primary/90">
      <h1 className="text-3xl font-semibold">{t('title')}</h1>
      <p>{error.message}</p>
      <section className="space-x-8">
        <Button onClick={() => reset()} className="font-semibold">
          {t('Button.try')}
        </Button>
        <Button asChild variant="secondary" className="font-semibold">
          <a href="/">{t('Button.back')}</a>
        </Button>
      </section>
    </main>
  );
}
