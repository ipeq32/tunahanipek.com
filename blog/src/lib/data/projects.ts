import { cache } from 'react';

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  mapProjectToDto,
  projectDetailInclude,
  projectListInclude,
  type ProjectDto,
} from '@/lib/project-mapper';
import { publishedTranslationFilter } from '@/lib/published-translation-query';
import { resolveLanguageCode } from '@/lib/languages';
import {
  buildPaginatedResult,
  type PageSize,
  type PaginatedResult,
} from '@/lib/pagination';

export async function getPublishedProjects(
  localeInput?: string,
): Promise<ProjectDto[]> {
  const result = await getPublishedProjectsPaginated(localeInput ?? 'tr', 1, 100);
  return result.data;
}

export async function getPublishedProjectsPaginated(
  localeInput: string,
  page: number,
  limit: PageSize,
): Promise<PaginatedResult<ProjectDto>> {
  const locale = await resolveLanguageCode(localeInput);
  const skip = (page - 1) * limit;
  const where = {
    deletedAt: null,
    translations: publishedTranslationFilter(locale),
  };

  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      include: projectListInclude,
    }),
  ]);

  return buildPaginatedResult(
    projects.map((project) => mapProjectToDto(project, locale)),
    page,
    limit,
    total
  );
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
  const result = await getAdminProjectsPaginated(localeInput ?? 'tr', 1, 100);
  return result.data;
}

type AdminProjectFilters = {
  search?: string;
  status?: 'all' | 'published' | 'drafts';
};

function buildAdminProjectWhere(
  locale: string,
  filters: AdminProjectFilters = {}
): Prisma.ProjectWhereInput {
  const search = filters.search?.trim();
  const conditions: Prisma.ProjectWhereInput[] = [{ deletedAt: null }];

  if (filters.status === 'published') {
    conditions.push({
      translations: {
        some: {
          published: true,
        },
      },
    });
  }

  if (filters.status === 'drafts') {
    conditions.push({
      NOT: {
        translations: {
          some: {
            published: true,
          },
        },
      },
    });
  }

  if (search) {
    conditions.push({
      translations: {
        some: {
          language: { code: locale },
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    });
  }

  return { AND: conditions };
}

export type AdminProjectStats = {
  total: number;
  published: number;
  drafts: number;
};

export async function getAdminProjectStats(): Promise<AdminProjectStats> {
  const baseWhere = { deletedAt: null };

  const [total, published] = await Promise.all([
    prisma.project.count({ where: baseWhere }),
    prisma.project.count({
      where: {
        ...baseWhere,
        translations: {
          some: {
            published: true,
          },
        },
      },
    }),
  ]);

  return {
    total,
    published,
    drafts: total - published,
  };
}

export async function getAdminProjectsPaginated(
  localeInput: string,
  page: number,
  limit: PageSize,
  filters: AdminProjectFilters = {}
): Promise<PaginatedResult<ProjectDto> & { stats: AdminProjectStats }> {
  const locale = await resolveLanguageCode(localeInput);
  const skip = (page - 1) * limit;
  const where = buildAdminProjectWhere(locale, filters);

  const [total, projects, stats] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      include: projectDetailInclude,
    }),
    getAdminProjectStats(),
  ]);

  return {
    ...buildPaginatedResult(
      projects.map((project) =>
        mapProjectToDto(project, locale, { includeAllTranslations: true })
      ),
      page,
      limit,
      total
    ),
    stats,
  };
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

export async function getAllAdminProjectsForSort(
  localeInput: string,
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

export async function reorderAdminProjects(orderedIds: string[]): Promise<void> {
  const uniqueIds = new Set(orderedIds);
  if (uniqueIds.size !== orderedIds.length) {
    throw new Error('Duplicate project ids');
  }

  const existing = await prisma.project.findMany({
    where: { deletedAt: null, id: { in: orderedIds } },
    select: { id: true },
  });

  if (existing.length !== orderedIds.length) {
    throw new Error('Invalid project ids');
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.project.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );
}
