import { defineRouting, Pathnames } from 'next-intl/routing';
import routes from './routes';

export const defaultLocale = 'en' as const;
export const locales = ['en', 'tr'] as const;

export const pathnames = routes satisfies Pathnames<typeof locales>;

export const localePrefix = 'always';
export const routing = defineRouting({
  locales,
  defaultLocale,
  pathnames,
  localePrefix,
});

export type AppPathnames = keyof typeof pathnames;

export const port = process.env.PORT || 3000;

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    const url = process.env.VERCEL_URL;
    return url.startsWith('http') ? url.replace(/\/$/, '') : `https://${url}`;
  }
  return `http://localhost:${port}`;
}

/** @deprecated Use getSiteUrl() */
export const host = getSiteUrl();
