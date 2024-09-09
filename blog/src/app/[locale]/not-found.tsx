'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('Error.Main.NotFound');

  return (
    <main className="grid min-h-screen place-content-center space-y-5 text-center bg-sky-50 dark:bg-primary/90">
      <h2 className="text-3xl font-semibold">{t('title')}</h2>
      <p>{t('description')}</p>
      <Button asChild variant="outline" className="font-semibold">
        <Link href="/">{t('button')}</Link>
      </Button>
    </main>
  );
}
