'use client';

import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

type LocaleFallbackBannerProps = {
  contentLocale: string;
  namespace: 'Blog.LocaleFallback' | 'Pages.Project.LocaleFallback';
  className?: string;
};

export function LocaleFallbackBanner({
  contentLocale,
  namespace,
  className = 'mb-8',
}: LocaleFallbackBannerProps) {
  const requestedLocale = useLocale();
  const t = useTranslations(namespace);
  const tLocale = useTranslations('LocaleSwitcher');

  if (requestedLocale === contentLocale) {
    return null;
  }

  const requestedLanguage = tLocale('locale', { locale: requestedLocale });
  const contentLanguage = tLocale('locale', { locale: contentLocale });

  return (
    <div
      role="status"
      className={`flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100 ${className}`}
    >
      <Languages
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
        aria-hidden
      />
      <p className="leading-relaxed">
        {t('message', { requestedLanguage, contentLanguage })}
      </p>
    </div>
  );
}
