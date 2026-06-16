import type { SiteSnippetType } from '@prisma/client';

import type { PageSize } from '../pagination';
import { prisma } from '../prisma';
import { DEFAULT_SITE_SNIPPETS } from './defaults';
import type { ReplaceSiteSnippetsInput, SiteSnippetDto } from './types';

const SUPPORTED_LOCALES = ['tr', 'en'] as const;

let repairCatalogPromise: Promise<void> | null = null;

function mapRow(row: {
  id: string;
  type: SiteSnippetType;
  locale: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: Date;
}): SiteSnippetDto {
  return {
    id: row.id,
    type: row.type,
    locale: row.locale,
    content: row.content,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function ensureSiteSnippetsSeeded(): Promise<void> {
  const count = await prisma.siteSnippet.count();
  if (count > 0) {
    return;
  }

  await prisma.siteSnippet.createMany({
    data: DEFAULT_SITE_SNIPPETS,
  });
}

/**
 * Aynı locale+type+content için yinelenen satırları siler.
 */
export async function deduplicateSiteSnippets(): Promise<number> {
  const rows = await prisma.siteSnippet.findMany({
    orderBy: [
      { locale: 'asc' },
      { type: 'asc' },
      { sortOrder: 'asc' },
      { createdAt: 'asc' },
    ],
    select: { id: true, locale: true, type: true, content: true },
  });

  const seen = new Set<string>();
  const duplicateIds: string[] = [];

  for (const row of rows) {
    const key = `${row.locale}:${row.type}:${row.content}`;
    if (seen.has(key)) {
      duplicateIds.push(row.id);
      continue;
    }
    seen.add(key);
  }

  if (duplicateIds.length === 0) {
    return 0;
  }

  await prisma.siteSnippet.deleteMany({
    where: { id: { in: duplicateIds } },
  });

  return duplicateIds.length;
}

/**
 * Varsayılan seed'de olup veritabanında eksik kalan satırları ekler.
 */
export async function syncMissingDefaultSiteSnippets(): Promise<number> {
  const existing = await prisma.siteSnippet.findMany({
    select: { locale: true, type: true, content: true },
  });

  const existingKeys = new Set(
    existing.map((row) => `${row.locale}:${row.type}:${row.content}`)
  );

  const missing = DEFAULT_SITE_SNIPPETS.filter(
    (snippet) =>
      !existingKeys.has(`${snippet.locale}:${snippet.type}:${snippet.content}`)
  );

  if (missing.length === 0) {
    return 0;
  }

  const grouped = new Map<string, typeof missing>();

  for (const snippet of missing) {
    const groupKey = `${snippet.locale}:${snippet.type}`;
    const group = grouped.get(groupKey) ?? [];
    group.push(snippet);
    grouped.set(groupKey, group);
  }

  let inserted = 0;

  for (const [groupKey, snippets] of grouped) {
    const [locale, type] = groupKey.split(':') as [string, SiteSnippetType];
    const aggregate = await prisma.siteSnippet.aggregate({
      where: { locale, type },
      _max: { sortOrder: true },
    });
    let sortOrder = aggregate._max.sortOrder ?? -1;

    const result = await prisma.siteSnippet.createMany({
      data: snippets.map((snippet) => {
        sortOrder += 1;
        return {
          type: snippet.type,
          locale: snippet.locale,
          content: snippet.content,
          sortOrder,
          isActive: true,
        };
      }),
      skipDuplicates: true,
    });

    inserted += result.count;
  }

  return inserted;
}

/**
 * Yinelenenleri temizler ve eksik varsayılanları ekler.
 * Paralel isteklerde tek sefer çalışması için promise ile serileştirilir.
 */
export async function repairSiteSnippetsCatalog(): Promise<void> {
  if (!repairCatalogPromise) {
    repairCatalogPromise = (async () => {
      await deduplicateSiteSnippets();
      await syncMissingDefaultSiteSnippets();
    })().finally(() => {
      repairCatalogPromise = null;
    });
  }

  await repairCatalogPromise;
}

export async function querySnippetLines(
  locale: string,
  type: SiteSnippetType,
  activeOnly: boolean
): Promise<string[]> {
  await ensureSiteSnippetsSeeded();

  const rows = await prisma.siteSnippet.findMany({
    where: {
      locale,
      type,
      ...(activeOnly ? { isActive: true } : {}),
    },
    orderBy: { sortOrder: 'asc' },
    select: { content: true },
  });

  return rows.map((row) => row.content);
}

export async function queryAllSnippetsForAdmin(
  locale: string,
  type: SiteSnippetType
): Promise<SiteSnippetDto[]> {
  await ensureSiteSnippetsSeeded();

  const rows = await prisma.siteSnippet.findMany({
    where: { locale, type },
    orderBy: { sortOrder: 'asc' },
  });

  return rows.map(mapRow);
}

export async function querySnippetsForAdmin(
  locale: string,
  type: SiteSnippetType,
  page = 1,
  limit: PageSize = 20
): Promise<{ items: SiteSnippetDto[]; total: number }> {
  await ensureSiteSnippetsSeeded();

  const skip = (page - 1) * limit;
  const where = { locale, type };

  const [total, rows] = await Promise.all([
    prisma.siteSnippet.count({ where }),
    prisma.siteSnippet.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return {
    total,
    items: rows.map(mapRow),
  };
}

export async function replaceSiteSnippetsInDb(
  input: ReplaceSiteSnippetsInput
): Promise<SiteSnippetDto[]> {
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(input.locale)) {
    throw new Error('Unsupported locale');
  }

  const items = input.items.map((item, index) => ({
    type: input.type,
    locale: input.locale,
    content: item.content.trim(),
    sortOrder: index,
    isActive: item.isActive ?? true,
  }));

  await prisma.$transaction([
    prisma.siteSnippet.deleteMany({
      where: {
        type: input.type,
        locale: input.locale,
      },
    }),
    prisma.siteSnippet.createMany({
      data: items,
    }),
  ]);

  const savedSnippets = await queryAllSnippetsForAdmin(
    input.locale,
    input.type
  );
  return savedSnippets;
}
