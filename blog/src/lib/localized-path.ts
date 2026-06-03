import { pathnames, type AppPathnames } from '@/config';
import type { locales } from '@/config';

type Locale = (typeof locales)[number];

export function getLocalizedPathname(
  route: AppPathnames,
  locale: Locale,
): string {
  const entry = pathnames[route];
  if (typeof entry === 'string') {
    return entry;
  }
  return entry[locale];
}

export function getCanonicalPath(route: AppPathnames, locale: Locale): string {
  return `/${locale}${getLocalizedPathname(route, locale)}`;
}
