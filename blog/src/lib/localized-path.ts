import { locales, pathnames, type AppPathnames } from '@/config';

type Locale = (typeof locales)[number];

function applyReplacements(
  pathname: string,
  replacements?: Record<string, string>,
): string {
  if (!replacements) {
    return pathname;
  }
  return Object.entries(replacements).reduce(
    (acc, [token, value]) => acc.replaceAll(token, value),
    pathname,
  );
}

export function getLocalizedPathname(
  route: AppPathnames,
  locale: Locale,
  replacements?: Record<string, string>,
): string {
  const entry = pathnames[route];
  const pathname = typeof entry === 'string' ? entry : entry[locale];
  return applyReplacements(pathname, replacements);
}

export function getCanonicalPath(
  route: AppPathnames,
  locale: Locale,
  replacements?: Record<string, string>,
): string {
  return `/${locale}${getLocalizedPathname(route, locale, replacements)}`;
}

export function getLanguageAlternates(
  route: AppPathnames,
  replacements?: Record<string, string>,
): Record<Locale, string> {
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      getCanonicalPath(route, locale, replacements),
    ]),
  ) as Record<Locale, string>;
}
