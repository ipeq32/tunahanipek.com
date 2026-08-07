import { unstable_cache, revalidateTag } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { loadPublicSnapshot } from '@/lib/public-snapshot/load';
import {
  queryCategoriesFromSnapshot,
  queryTagsFromSnapshot,
} from '@/lib/public-snapshot/query';

function parseNames(input?: string): string[] {
  if (!input?.trim()) return [];
  return [...new Set(input.split(',').map((n) => n.trim()).filter(Boolean))];
}

export function parseTagNames(tags?: string): string[] {
  return parseNames(tags).map((n) => n.toLowerCase());
}

export function parseCategoryNames(categories?: string): string[] {
  return parseNames(categories);
}

export async function syncBlogTaxonomy(
  blogId: string,
  tagsInput?: string,
  categoriesInput?: string
) {
  const tagNames = parseTagNames(tagsInput);
  const categoryNames = parseCategoryNames(categoriesInput);

  await prisma.blog.update({
    where: { id: blogId },
    data: {
      tags: {
        set: [],
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
      categories: {
        set: [],
        connectOrCreate: categoryNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
  });

  revalidateTag('blog-tags', { expire: 0 });
  revalidateTag('blog-categories', { expire: 0 });
}

async function queryAllTags() {
  try {
    return await prisma.tag.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  } catch {
    const snapshot = await loadPublicSnapshot();
    return snapshot ? queryTagsFromSnapshot(snapshot) : [];
  }
}

async function queryAllCategories() {
  try {
    return await prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  } catch {
    const snapshot = await loadPublicSnapshot();
    return snapshot ? queryCategoriesFromSnapshot(snapshot) : [];
  }
}

export const getAllTags = unstable_cache(
  async () => queryAllTags(),
  ['blog-tags'],
  {
    revalidate: 300,
    tags: ['blog-tags'],
  },
);

export const getAllCategories = unstable_cache(
  async () => queryAllCategories(),
  ['blog-categories'],
  { revalidate: 300, tags: ['blog-categories'] },
);
