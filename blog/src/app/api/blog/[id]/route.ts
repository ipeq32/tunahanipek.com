import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { blogListInclude, mapBlogToResponse } from '@/lib/blog-mapper';
import { syncBlogTaxonomy } from '@/lib/blog-taxonomy';
import {
  updateBlogTranslationPublished,
  upsertBlogTranslations,
} from '@/lib/blog-translations';
import { isModerator, isSuperAdmin } from '@/lib/auth-roles';
import { logger } from '@/lib/logger';
import { revalidateBlogDetail, revalidateBlogList } from '@/lib/revalidate-public';
import { updateBlogSchema } from '@/lib/validations/blog';
import { apiError, apiMessage } from '@/lib/api-i18n';
import { resolveRequestLocale } from '@/lib/languages';
import { NextResponse } from 'next/server';

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
        translations: {
          some: {
            published: true,
            language: { code: locale, isActive: true },
          },
        },
      },
      include: blogListInclude,
    });

    if (!blog) {
      return apiError(request, 'blog.notFound', 404);
    }

    return NextResponse.json(
      { data: mapBlogToResponse(blog, locale) },
      { status: 200 },
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
  const session = await auth();
  const user = session?.user;

  if (!user || !isModerator(user.role)) {
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

    const isOwner = existing.authorId === user.id;
    if (!isSuperAdmin(user.role) && !isOwner) {
      return apiError(request, 'forbidden', 403);
    }

    const blogData: {
      image?: string;
      shortImage?: string;
    } = {};

    if (body.image !== undefined) blogData.image = body.image;
    if (body.shortImage !== undefined) blogData.shortImage = body.shortImage;

    if (Object.keys(blogData).length > 0) {
      await prisma.blog.update({
        where: { id },
        data: blogData,
      });
    }

    if (body.translations?.length) {
      await upsertBlogTranslations(id, body.translations);
    }

    if (body.published !== undefined && isSuperAdmin(user.role)) {
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
      include: blogListInclude,
    });

    revalidateBlogDetail(id);

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
  const session = await auth();
  const user = session?.user;

  if (!user || !isModerator(user.role)) {
    return apiError(request, 'forbidden', 403);
  }

  try {
    const existing = await prisma.blog.findUnique({ where: { id } });

    if (!existing || existing.deletedAt) {
      return apiError(request, 'blog.notFound', 404);
    }

    const isOwner = existing.authorId === user.id;
    if (!isSuperAdmin(user.role) && !isOwner) {
      return apiError(request, 'forbidden', 403);
    }

    await prisma.blog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

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
