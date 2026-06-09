import { prisma } from '@/lib/prisma';
import {
  mapProjectToDto,
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

export async function getPublishedProjectById(
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
    include: projectListInclude,
  });

  return project ? mapProjectToDto(project, locale) : null;
}

export async function getAdminProjects(
  localeInput?: string,
): Promise<ProjectDto[]> {
  const locale = await resolveLanguageCode(localeInput);

  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    include: projectListInclude,
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
    include: projectListInclude,
  });

  return project
    ? mapProjectToDto(project, locale, { includeAllTranslations: true })
    : null;
}
