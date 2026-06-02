import { prisma } from '@/lib/prisma';

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
}

export async function getAllTags() {
  return prisma.tag.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}
