import 'server-only';

import type { SiteSnippetType } from '@prisma/client';
import { revalidateTag, unstable_cache } from 'next/cache';

import type { PageSize } from '@/lib/pagination';
import {
  queryAllSnippetsForAdmin,
  querySnippetLines,
  querySnippetsForAdmin,
  repairSiteSnippetsCatalog,
  replaceSiteSnippetsInDb,
} from '@/lib/site-snippets/store';

export type {
  ReplaceSiteSnippetsInput,
  SiteSnippetDto,
} from '@/lib/site-snippets/types';

const SITE_SNIPPETS_TAG = 'site-snippets';

const getCachedSnippetLines = unstable_cache(
  async (locale: string, type: SiteSnippetType) =>
    querySnippetLines(locale, type, true),
  ['site-snippet-lines'],
  { revalidate: 300, tags: [SITE_SNIPPETS_TAG] }
);

export async function getSiteSnippetLines(
  locale: string,
  type: SiteSnippetType
): Promise<string[]> {
  return getCachedSnippetLines(locale, type);
}

export async function getAllSiteSnippetsForAdmin(
  locale: string,
  type: SiteSnippetType
) {
  return queryAllSnippetsForAdmin(locale, type);
}

export async function repairSiteSnippets() {
  await repairSiteSnippetsCatalog();
}

export async function getSiteSnippetsForAdmin(
  locale: string,
  type: SiteSnippetType,
  page = 1,
  limit: PageSize = 100
) {
  return querySnippetsForAdmin(locale, type, page, limit);
}

export async function replaceSiteSnippets(
  input: Parameters<typeof replaceSiteSnippetsInDb>[0]
) {
  const result = await replaceSiteSnippetsInDb(input);
  revalidateTag(SITE_SNIPPETS_TAG, { expire: 0 });
  return result;
}
