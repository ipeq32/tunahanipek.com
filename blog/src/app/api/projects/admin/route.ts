import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { getAdminProjectsPaginated, getAllAdminProjectsForSort } from '@/lib/data/projects';
import { mapProjectToDto, projectDetailInclude } from '@/lib/project-mapper';
import { upsertProjectTranslations, updateAllProjectTranslationsPublished } from '@/lib/project-translations';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { revalidateProjectDetail } from '@/lib/revalidate-public';
import { createProjectSchema } from '@/lib/validations/project';
import { apiError, apiMessage } from '@/lib/api-i18n';
import { autoFillMissingTranslations } from '@/lib/ai/auto-fill-missing';
import { resolveRequestLocale } from '@/lib/languages';
import { parsePaginationFromRequest } from '@/lib/pagination';
import { after, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type StatusFilter = 'all' | 'published' | 'drafts';

function parseStatusFilter(value: string | null): StatusFilter {
  if (value === 'published' || value === 'drafts') {
    return value;
  }
  return 'all';
}

async function getNextSortOrder(): Promise<number> {
  const last = await prisma.project.findFirst({
    where: { deletedAt: null },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  return (last?.sortOrder ?? 0) + 1;
}

export async function GET(request: Request) {
  const context = await requirePermission(PERMISSIONS['project:admin-list']);
  if (!context) {
    return apiError(request, 'forbidden', 403);
  }

  try {
    const locale = await resolveRequestLocale(request);
    const { page, limit } = parsePaginationFromRequest(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? undefined;
    const status = parseStatusFilter(searchParams.get('status'));
    const sortable = searchParams.get('sortable') === '1';

    if (sortable) {
      const data = await getAllAdminProjectsForSort(locale);

      return NextResponse.json({
        data,
        locale,
      });
    }

    const result = await getAdminProjectsPaginated(locale, page, limit, {
      search,
      status,
    });

    return NextResponse.json({
      data: result.data,
      pagination: result.pagination,
      stats: result.stats,
      locale,
    });
  } catch (error) {
    logger.error('Failed to fetch admin projects', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}

export async function POST(request: Request) {
  const locale = await resolveRequestLocale(request);
  const context = await requirePermission(PERMISSIONS['project:create']);
  if (!context) {
    return apiError(request, 'forbidden', 403);
  }

  try {
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.errors[0]?.message ??
        (await apiMessage(locale, 'invalidPayload'));
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { url, image, gallery, sortOrder, translations } = parsed.data;
    const resolvedSortOrder = sortOrder ?? (await getNextSortOrder());

    const project = await prisma.project.create({
      data: {
        url: url || null,
        image: image || null,
        gallery: gallery ?? [],
        sortOrder: resolvedSortOrder,
      },
    });

    await upsertProjectTranslations(project.id, translations);

    const created = await prisma.project.findUnique({
      where: { id: project.id },
      include: projectDetailInclude,
    });

    revalidateProjectDetail(project.id);

    after(async () => {
      const wasPublished =
        (await prisma.projectTranslation.count({
          where: { projectId: project.id, published: true },
        })) > 0;

      await autoFillMissingTranslations({
        entityType: 'project',
        entityId: project.id,
        providedTranslations: translations,
      });

      if (wasPublished) {
        await updateAllProjectTranslationsPublished(project.id, true);
        revalidateProjectDetail(project.id);
      }
    });

    return NextResponse.json(
      {
        data: created
          ? mapProjectToDto(created, locale, { includeAllTranslations: true })
          : null,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error('Failed to create project', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}
