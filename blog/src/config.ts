import { defineRouting, Pathnames } from 'next-intl/routing';
import routes from './routes';

export const defaultLocale = 'en' as const;
export const locales = ['en', 'tr'] as const;

export const pathnames = routes satisfies Pathnames<typeof locales>;

// Use the default: `always`
export const localePrefix = 'always';
export const routing = defineRouting({
  locales,
  defaultLocale,
  pathnames,
  localePrefix,
});

export type AppPathnames = keyof typeof pathnames;

export const port = process.env.PORT || 3000;

export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`;
