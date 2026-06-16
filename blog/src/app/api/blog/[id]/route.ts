import { PERMISSIONS } from '@/lib/auth/permissions';
import { requireAnyPermission } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { blogDetailInclude, mapBlogToResponse } from '@/lib/blog-mapper';
import { publishedTranslationFilter } from '@/lib/published-translation-query';
import { syncBlogTaxonomy } from '@/lib/blog-taxonomy';
import {
  updateBlogTranslationPublished,
  upsertBlogTranslations,
} from '@/lib/blog-translations';
import {
  canDeleteAnyBlog,
  canPublishBlog,
  canUpdateAnyBlog,
} from '@/lib/auth-roles';
import { logger } from '@/lib/logger';
import { revalidateBlogDetail, revalidateBlogList } from '@/lib/revalidate-public';
import { updateBlogSchema } from '@/lib/validations/blog';
import { apiError, apiMessage } from '@/lib/api-i18n';
import { autoFillMissingTranslations } from '@/lib/ai/auto-fill-missing';
import { resolveRequestLocale } from '@/lib/languages';
import {
  collectBlogMediaUrls,
  deleteUploadedMedia,
  findRemovedMediaUrls,
} from '@/lib/uploaded-media';
import { PUBLIC_READ_CACHE_HEADERS } from '@/lib/api-cache';
import { after, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Params = {
  id: string;
};

export async function GET(
  request: Request,
  context: { params: Promise<Params> },
) {
  const { id } = await context.params;
  const locale = await resolveRequestLocale(request);

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id,
        deletedAt: null,
        translations: publishedTranslationFilter(locale),
      },
      include: blogDetailInclude,
    });

    if (!blog) {
      return apiError(request, 'blog.notFound', 404);
    }

    return NextResponse.json(
      { data: mapBlogToResponse(blog, locale) },
      { status: 200, headers: PUBLIC_READ_CACHE_HEADERS },
    );
  } catch (error) {
    logger.error('Failed to fetch blog', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<Params> },
) {
  const { id } = await context.params;
  const locale = await resolveRequestLocale(request);
  const authContext = await requireAnyPermission([
    PERMISSIONS['blog:update'],
    PERMISSIONS['blog:update-any'],
  ]);

  if (!authContext) {
    return apiError(request, 'forbidden', 403);
  }

  try {
    const parsed = updateBlogSchema.safeParse(await request.json());

    if (!parsed.success) {
      const message =
        parsed.error.errors[0]?.message ??
        (await apiMessage(locale, 'validationFailed'));
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const body = parsed.data;
    const existing = await prisma.blog.findUnique({ where: { id } });

    if (!existing || existing.deletedAt) {
      return apiError(request, 'blog.notFound', 404);
    }

    const userEmail = authContext.session.user.email;
    const isOwner = existing.authorId === authContext.userId;
    if (!canUpdateAnyBlog(authContext.permissions, userEmail) && !isOwner) {
      return apiError(request, 'forbidden', 403);
    }

    const blogData: {
      image?: string;
      shortImage?: string;
    } = {};

    if (body.image !== undefined) blogData.image = body.image;
    if (body.shortImage !== undefined) blogData.shortImage = body.shortImage;

    const nextMedia = collectBlogMediaUrls({
      image: body.image !== undefined ? body.image : existing.image,
      shortImage:
        body.shortImage !== undefined ? body.shortImage : existing.shortImage,
    });
    const removedMedia = findRemovedMediaUrls(
      collectBlogMediaUrls(existing),
      nextMedia,
    );

    if (Object.keys(blogData).length > 0) {
      await prisma.blog.update({
        where: { id },
        data: blogData,
      });
    }

    if (removedMedia.length > 0) {
      await deleteUploadedMedia(removedMedia);
    }

    if (body.translations?.length) {
      await upsertBlogTranslations(id, body.translations);
    }

    if (
      body.published !== undefined &&
      canPublishBlog(authContext.permissions, userEmail)
    ) {
      const languageCode = body.languageCode ?? locale;
      const updated = await updateBlogTranslationPublished(
        id,
        languageCode,
        body.published,
      );

      if (!updated) {
        return apiError(request, 'language.notFound', 400);
      }
    }

    if (body.tags !== undefined || body.categories !== undefined) {
      await syncBlogTaxonomy(id, body.tags, body.categories);
    }

    const withTaxonomy = await prisma.blog.findUnique({
      where: { id },
      include: blogDetailInclude,
    });

    revalidateBlogDetail(id);

    if (body.translations?.length) {
      after(async () => {
        await autoFillMissingTranslations({
          entityType: 'blog',
          entityId: id,
          providedTranslations: body.translations ?? [],
        });
      });
    }

    return NextResponse.json({
      data: withTaxonomy
        ? mapBlogToResponse(withTaxonomy, locale, { includeAllTranslations: true })
        : null,
    });
  } catch (error) {
    logger.error('Failed to update blog', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<Params> },
) {
  const { id } = await context.params;
  const authContext = await requireAnyPermission([
    PERMISSIONS['blog:delete'],
    PERMISSIONS['blog:delete-any'],
  ]);

  if (!authContext) {
    return apiError(request, 'forbidden', 403);
  }

  try {
    const existing = await prisma.blog.findUnique({ where: { id } });

    if (!existing || existing.deletedAt) {
      return apiError(request, 'blog.notFound', 404);
    }

    const userEmail = authContext.session.user.email;
    const isOwner = existing.authorId === authContext.userId;
    if (!canDeleteAnyBlog(authContext.permissions, userEmail) && !isOwner) {
      return apiError(request, 'forbidden', 403);
    }

    await prisma.blog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await deleteUploadedMedia(collectBlogMediaUrls(existing));

    revalidateBlogList();
    revalidateBlogDetail(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete blog', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}
