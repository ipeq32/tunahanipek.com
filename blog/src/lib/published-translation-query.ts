import { defaultLocale } from '@/config';

export function getPublishedTranslationLocaleCodes(locale: string): string[] {
  if (locale === defaultLocale) {
    return [locale];
  }

  return [locale, defaultLocale];
}

type TranslationSearchFilter = {
  some: {
    published: true;
    language: { code: { in: string[] }; isActive: true };
    OR?: Array<{
      title?: { contains: string; mode: 'insensitive' };
      summary?: { contains: string; mode: 'insensitive' };
      content?: { contains: string; mode: 'insensitive' };
      description?: { contains: string; mode: 'insensitive' };
    }>;
  };
};

export function publishedTranslationFilter(
  locale: string,
  search?: string,
): TranslationSearchFilter {
  const codes = getPublishedTranslationLocaleCodes(locale);
  const trimmedSearch = search?.trim();

  return {
    some: {
      published: true,
      language: { code: { in: codes }, isActive: true },
      ...(trimmedSearch
        ? {
            OR: [
              {
                title: {
                  contains: trimmedSearch,
                  mode: 'insensitive' as const,
                },
              },
              {
                summary: {
                  contains: trimmedSearch,
                  mode: 'insensitive' as const,
                },
              },
              {
                content: {
                  contains: trimmedSearch,
                  mode: 'insensitive' as const,
                },
              },
              {
                description: {
                  contains: trimmedSearch,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    },
  };
}
