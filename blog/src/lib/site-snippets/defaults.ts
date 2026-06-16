import type { SiteSnippetType } from '@prisma/client';
import en from '../../../messages/en.json';
import tr from '../../../messages/tr.json';

const locales = ['tr', 'en'] as const;

type LocaleCode = (typeof locales)[number];

type DefaultSnippet = {
  type: SiteSnippetType;
  locale: LocaleCode;
  content: string;
  sortOrder: number;
};

const messageSources: Record<LocaleCode, typeof tr> = {
  tr,
  en,
};

function buildDefaultSnippets(): DefaultSnippet[] {
  const snippets: DefaultSnippet[] = [];

  for (const locale of locales) {
    const messages = messageSources[locale];

    messages.Tips.items.forEach((content, index) => {
      snippets.push({
        type: 'TIP',
        locale,
        content,
        sortOrder: index,
      });
    });

    messages.Footer.mottos.forEach((content, index) => {
      snippets.push({
        type: 'FOOTER_MOTTO',
        locale,
        content,
        sortOrder: index,
      });
    });
  }

  return snippets;
}

export const DEFAULT_SITE_SNIPPETS = buildDefaultSnippets();

export function getDefaultSnippetContents(
  locale: string,
  type: SiteSnippetType
): string[] {
  return DEFAULT_SITE_SNIPPETS.filter(
    (snippet) => snippet.locale === locale && snippet.type === type
  )
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((snippet) => snippet.content);
}

export function getDefaultSnippetsByLocale(): Record<
  string,
  { tips: string[]; mottos: string[] }
> {
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      {
        tips: getDefaultSnippetContents(locale, 'TIP'),
        mottos: getDefaultSnippetContents(locale, 'FOOTER_MOTTO'),
      },
    ])
  );
}
