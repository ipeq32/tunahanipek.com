import { getLocale } from 'next-intl/server';

import { getSession } from '@/lib/cached-session';
import { getSiteSnippetLines } from '@/lib/site-snippets';

import Footer from './Footer';

async function loadMottos(locale: string): Promise<string[] | undefined> {
  try {
    const mottos = await getSiteSnippetLines(locale, 'FOOTER_MOTTO');
    return mottos.length > 0 ? mottos : undefined;
  } catch {
    return undefined;
  }
}

const FooterShell = async () => {
  const [session, locale] = await Promise.all([getSession(), getLocale()]);
  const mottos = await loadMottos(locale);

  return (
    <Footer
      isAuthenticated={!!session?.user}
      userName={session?.user?.name ?? null}
      mottos={mottos}
    />
  );
};

export default FooterShell;
