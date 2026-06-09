import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/sanitize';
import { getLanguageByCode } from '@/lib/languages';
import type { ProjectTranslationDto } from '@/lib/project-mapper';

type UpsertTranslationInput = {
  languageCode: string;
  title?: string;
  description?: string;
  published?: boolean;
};

export async function upsertProjectTranslations(
  projectId: string,
  translations: UpsertTranslationInput[],
  defaultPublished = false,
): Promise<void> {
  for (const item of translations) {
    const language = await getLanguageByCode(item.languageCode);
    if (!language) {
      continue;
    }

    const existing = await prisma.projectTranslation.findUnique({
      where: {
        projectId_languageId: {
          projectId,
          languageId: language.id,
        },
      },
    });

    if (existing) {
      await prisma.projectTranslation.update({
        where: { id: existing.id },
        data: {
          ...(item.title !== undefined && { title: item.title }),
          ...(item.description !== undefined && {
            description: sanitizeHtml(item.description),
          }),
          ...(item.published !== undefined && { published: item.published }),
        },
      });
      continue;
    }

    if (!item.title || !item.description) {
      continue;
    }

    await prisma.projectTranslation.create({
      data: {
        projectId,
        languageId: language.id,
        title: item.title,
        description: sanitizeHtml(item.description),
        published: item.published ?? defaultPublished,
      },
    });
  }
}

export async function updateProjectTranslationPublished(
  projectId: string,
  languageCode: string,
  published: boolean,
): Promise<boolean> {
  const language = await getLanguageByCode(languageCode);
  if (!language) {
    return false;
  }

  const existing = await prisma.projectTranslation.findUnique({
    where: {
      projectId_languageId: {
        projectId,
        languageId: language.id,
      },
    },
  });

  if (!existing) {
    return false;
  }

  await prisma.projectTranslation.update({
    where: { id: existing.id },
    data: { published },
  });

  return true;
}

export type { ProjectTranslationDto };
