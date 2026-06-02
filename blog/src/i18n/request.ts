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

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages:
      locale === 'en'
        ? (await import('../../messages/en.json')).default
        : (await import('../../messages/tr.json')).default,
  };
});
