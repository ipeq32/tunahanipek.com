import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import { mapProjectToDto, projectListInclude } from '@/lib/project-mapper';
import {
  updateProjectTranslationPublished,
  upsertProjectTranslations,
} from '@/lib/project-translations';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import {
  revalidateProjectDetail,
  revalidateProjectList,
} from '@/lib/revalidate-public';
import { updateProjectSchema } from '@/lib/validations/project';
import { apiError, apiMessage } from '@/lib/api-i18n';
import { resolveRequestLocale } from '@/lib/languages';
import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const locale = await resolveRequestLocale(request);
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return apiError(request, 'forbidden', 403);
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.errors[0]?.message ??
        (await apiMessage(locale, 'invalidPayload'));
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const existing = await prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return apiError(request, 'project.notFound', 404);
    }

    const data = parsed.data;

    const projectData: {
      url?: string | null;
      image?: string | null;
      sortOrder?: number;
    } = {};

    if (data.url !== undefined) projectData.url = data.url || null;
    if (data.image !== undefined) projectData.image = data.image || null;
    if (data.sortOrder !== undefined) projectData.sortOrder = data.sortOrder;

    if (Object.keys(projectData).length > 0) {
      await prisma.project.update({
        where: { id },
        data: projectData,
      });
    }

    if (data.translations?.length) {
      await upsertProjectTranslations(id, data.translations);
    }

    if (data.published !== undefined) {
      const languageCode = data.languageCode ?? locale;
      const updated = await updateProjectTranslationPublished(
        id,
        languageCode,
        data.published,
      );

      if (!updated) {
        return apiError(request, 'language.notFound', 400);
      }
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: projectListInclude,
    });

    revalidateProjectDetail(id);

    return NextResponse.json({
      data: project
        ? mapProjectToDto(project, locale, { includeAllTranslations: true })
        : null,
    });
  } catch (error) {
    logger.error('Failed to update project', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return apiError(request, 'forbidden', 403);
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return apiError(request, 'project.notFound', 404);
    }

    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidateProjectList();
    revalidateProjectDetail(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete project', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}
