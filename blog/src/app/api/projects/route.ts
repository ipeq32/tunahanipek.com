import { prisma } from '@/lib/prisma';
import { mapProjectToDto, projectListInclude } from '@/lib/project-mapper';
import { publishedTranslationFilter } from '@/lib/published-translation-query';
import { logger } from '@/lib/logger';
import { apiError } from '@/lib/api-i18n';
import { resolveRequestLocale } from '@/lib/languages';
import { PUBLIC_READ_CACHE_HEADERS } from '@/lib/api-cache';
import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET(request: Request) {
  const locale = await resolveRequestLocale(request);

  try {
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        translations: publishedTranslationFilter(locale),
      },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      include: projectListInclude,
    });

    return NextResponse.json(
      {
        data: projects.map((project) => mapProjectToDto(project, locale)),
        locale,
      },
      { headers: PUBLIC_READ_CACHE_HEADERS },
    );
  } catch (error) {
    logger.error('Failed to fetch projects', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}
