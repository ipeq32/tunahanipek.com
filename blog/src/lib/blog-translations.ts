import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/sanitize';
import { getLanguageByCode } from '@/lib/languages';
import type { BlogTranslationInput } from '@/types/blog';

type UpsertTranslationInput = Partial<BlogTranslationInput> & {
  languageCode: string;
  published?: boolean;
};

export async function upsertBlogTranslations(
  blogId: string,
  translations: UpsertTranslationInput[],
  defaultPublished = false,
): Promise<void> {
  for (const item of translations) {
    const language = await getLanguageByCode(item.languageCode);
    if (!language) {
      continue;
    }

    const existing = await prisma.blogTranslation.findUnique({
      where: {
        blogId_languageId: {
          blogId,
          languageId: language.id,
        },
      },
    });

    if (existing) {
      await prisma.blogTranslation.update({
        where: { id: existing.id },
        data: {
          ...(item.title !== undefined && { title: item.title }),
          ...(item.content !== undefined && {
            content: sanitizeHtml(item.content),
          }),
          ...(item.summary !== undefined && {
            summary: sanitizeHtml(item.summary),
          }),
          ...(item.published !== undefined && { published: item.published }),
        },
      });
      continue;
    }

    if (!item.title || !item.content || !item.summary) {
      continue;
    }

    await prisma.blogTranslation.create({
      data: {
        blogId,
        languageId: language.id,
        title: item.title,
        content: sanitizeHtml(item.content),
        summary: sanitizeHtml(item.summary),
        published: item.published ?? defaultPublished,
      },
    });
  }
}

export async function updateBlogTranslationPublished(
  blogId: string,
  languageCode: string,
  published: boolean,
): Promise<boolean> {
  const language = await getLanguageByCode(languageCode);
  if (!language) {
    return false;
  }

  const existing = await prisma.blogTranslation.findUnique({
    where: {
      blogId_languageId: {
        blogId,
        languageId: language.id,
      },
    },
  });

  if (!existing) {
    return false;
  }

  await prisma.blogTranslation.update({
    where: { id: existing.id },
    data: { published },
  });

  return true;
}
