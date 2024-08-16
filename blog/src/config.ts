import { Pathnames } from 'next-intl/routing';
import routes from './routes';

export const defaultLocale = 'en' as const;
export const locales = ['en', 'tr'] as const;

export const pathnames = routes satisfies Pathnames<typeof locales>;

// Use the default: `always`
export const localePrefix = 'always';

export type AppPathnames = keyof typeof pathnames;
