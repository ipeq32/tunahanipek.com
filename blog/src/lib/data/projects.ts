import { cache } from 'react';

import { prisma } from '@/lib/prisma';
import {
  mapProjectToDto,
  projectDetailInclude,
  projectListInclude,
  type ProjectDto,
} from '@/lib/project-mapper';
import { publishedTranslationFilter } from '@/lib/published-translation-query';
import { resolveLanguageCode } from '@/lib/languages';

export async function getPublishedProjects(
  localeInput?: string,
): Promise<ProjectDto[]> {
  const locale = await resolveLanguageCode(localeInput);

  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
      translations: publishedTranslationFilter(locale),
    },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    include: projectListInclude,
  });

  return projects.map((project) => mapProjectToDto(project, locale));
}

async function fetchPublishedProjectById(
  id: string,
  localeInput?: string,
): Promise<ProjectDto | null> {
  const locale = await resolveLanguageCode(localeInput);

  const project = await prisma.project.findFirst({
    where: {
      id,
      deletedAt: null,
      translations: publishedTranslationFilter(locale),
    },
    include: projectDetailInclude,
  });

  return project ? mapProjectToDto(project, locale) : null;
}

/** Metadata + sayfa dedupe için request-scoped cache. */
export const getPublishedProjectById = cache(fetchPublishedProjectById);

export async function getAdminProjects(
  localeInput?: string,
): Promise<ProjectDto[]> {
  const locale = await resolveLanguageCode(localeInput);

  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    include: projectDetailInclude,
  });

  return projects.map((project) =>
    mapProjectToDto(project, locale, { includeAllTranslations: true }),
  );
}

export async function getAdminProjectById(
  id: string,
  localeInput?: string,
): Promise<ProjectDto | null> {
  const locale = await resolveLanguageCode(localeInput);

  const project = await prisma.project.findFirst({
    where: { id, deletedAt: null },
    include: projectDetailInclude,
  });

  return project
    ? mapProjectToDto(project, locale, { includeAllTranslations: true })
    : null;
}
