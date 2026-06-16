import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { canPublishProject } from '@/lib/auth-roles';
import { getAdminProjectById } from '@/lib/data/projects';
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
import { autoFillMissingTranslations } from '@/lib/ai/auto-fill-missing';
import { resolveRequestLocale } from '@/lib/languages';
import {
  collectProjectMediaUrls,
  deleteUploadedMedia,
  findRemovedMediaUrls,
} from '@/lib/uploaded-media';
import { after, NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const locale = await resolveRequestLocale(request);
  const authContext = await requirePermission(PERMISSIONS['project:update']);
  if (!authContext) {
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
      gallery?: string[];
      sortOrder?: number;
    } = {};

    if (data.url !== undefined) {
      projectData.url =
        data.url === '' || data.url === null ? null : data.url;
    }
    if (data.image !== undefined) {
      projectData.image =
        data.image === '' || data.image === null ? null : data.image;
    }
    if (data.gallery !== undefined) {
      projectData.gallery = data.gallery;
    }
    if (data.sortOrder !== undefined) projectData.sortOrder = data.sortOrder;

    const nextMedia = collectProjectMediaUrls({
      image:
        data.image !== undefined
          ? data.image === '' || data.image === null
            ? null
            : data.image
          : existing.image,
      gallery: data.gallery !== undefined ? data.gallery : existing.gallery,
    });
    const removedMedia = findRemovedMediaUrls(
      collectProjectMediaUrls(existing),
      nextMedia,
    );

    if (Object.keys(projectData).length > 0) {
      await prisma.project.update({
        where: { id },
        data: projectData,
      });
    }

    if (removedMedia.length > 0) {
      await deleteUploadedMedia(removedMedia);
    }

    if (data.translations?.length) {
      await upsertProjectTranslations(id, data.translations);
    }

    if (data.published !== undefined) {
      if (
        !canPublishProject(
          authContext.permissions,
          authContext.session.user.email
        )
      ) {
        return apiError(request, 'forbidden', 403);
      }

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

    revalidateProjectDetail(id);

    if (data.translations?.length) {
      after(async () => {
        await autoFillMissingTranslations({
          entityType: 'project',
          entityId: id,
          providedTranslations: data.translations ?? [],
        });
      });
    }

    const project = await getAdminProjectById(id, locale);

    return NextResponse.json({ data: project });
  } catch (error) {
    logger.error('Failed to update project', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const authContext = await requirePermission(PERMISSIONS['project:delete']);
  if (!authContext) {
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

    await deleteUploadedMedia(collectProjectMediaUrls(existing));

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
