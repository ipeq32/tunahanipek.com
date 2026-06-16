import { getLocale } from 'next-intl/server';

import { getSiteSnippetLines } from '@/lib/site-snippets';

import { DidYouKnow, type DidYouKnowProps } from './did-you-know';

async function loadTipLines(locale: string): Promise<string[] | undefined> {
  try {
    const lines = await getSiteSnippetLines(locale, 'TIP');
    return lines.length > 0 ? lines : undefined;
  } catch {
    return undefined;
  }
}

export async function DidYouKnowShell(
  props: Omit<DidYouKnowProps, 'lines'>
) {
  const locale = await getLocale();
  const lines = await loadTipLines(locale);

  return <DidYouKnow {...props} lines={lines} />;
}
