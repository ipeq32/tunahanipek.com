import { prisma } from '@/lib/prisma';
import { mapProjectToDto, projectListInclude } from '@/lib/project-mapper';
import { logger } from '@/lib/logger';
import { apiError } from '@/lib/api-i18n';
import { resolveRequestLocale } from '@/lib/languages';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const locale = await resolveRequestLocale(request);

  try {
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        translations: {
          some: {
            published: true,
            language: { code: locale, isActive: true },
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      include: projectListInclude,
    });

    return NextResponse.json({
      data: projects.map((project) => mapProjectToDto(project, locale)),
      locale,
    });
  } catch (error) {
    logger.error('Failed to fetch projects', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}
