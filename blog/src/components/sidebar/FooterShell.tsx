import { getLocale } from 'next-intl/server';

import { getSession } from '@/lib/cached-session';
import { logger } from '@/lib/logger';
import { getSiteOwner } from '@/lib/site-owner';
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

async function loadSession() {
  try {
    return await getSession();
  } catch (error) {
    logger.error('Footer session lookup failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

const FooterShell = async () => {
  const [session, locale, siteOwner] = await Promise.all([
    loadSession(),
    getLocale(),
    getSiteOwner(),
  ]);
  const mottos = await loadMottos(locale);

  return (
    <Footer
      isAuthenticated={!!session?.user}
      userName={session?.user?.name ?? null}
      mottos={mottos}
      siteOwner={siteOwner}
    />
  );
};

export default FooterShell;
