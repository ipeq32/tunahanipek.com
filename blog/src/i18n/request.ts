import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/config';

export type Locale = (typeof locales)[number];

export function parseLocale(value: string): Locale {
  if (!locales.includes(value as Locale)) {
    notFound();
  }

  return value as Locale;
}

async function loadMessages(locale: Locale) {
  switch (locale) {
    case 'tr':
      return (await import('../../messages/tr.json')).default;
    case 'en':
    default:
      return (await import('../../messages/en.json')).default;
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    /** SSR ve hydration için aynı referans zamanı (relativeTime uyumsuzluğunu önler) */
    now: new Date(),
    messages: await loadMessages(locale as Locale),
  };
});
