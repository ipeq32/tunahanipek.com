import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { syncBlogTaxonomy } from '@/lib/blog-taxonomy';
import { upsertBlogTranslations } from '@/lib/blog-translations';
import { blogDetailInclude, mapBlogToResponse } from '@/lib/blog-mapper';
import { revalidateBlogDetail } from '@/lib/revalidate-public';
import { createBlogSchema } from '@/lib/validations/blog';
import { apiError, apiMessage } from '@/lib/api-i18n';
import { autoFillMissingTranslations } from '@/lib/ai/auto-fill-missing';
import { resolveRequestLocale } from '@/lib/languages';
import { after, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const locale = await resolveRequestLocale(req);

  try {
    const context = await requirePermission(PERMISSIONS['blog:create']);
    if (!context) {
      return apiError(req, 'forbidden', 403);
    }

    const parsed = createBlogSchema.safeParse(await req.json());

    if (!parsed.success) {
      const message =
        parsed.error.errors[0]?.message ??
        (await apiMessage(locale, 'validationFailed'));
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { image, shortImage, tags, categories, translations } = parsed.data;

    const res = await prisma.blog.create({
      data: {
        image,
        shortImage,
        author: {
          connect: { id: context.userId },
        },
      },
    });

    await upsertBlogTranslations(res.id, translations);
    await syncBlogTaxonomy(res.id, tags, categories);

    const blog = await prisma.blog.findUnique({
      where: { id: res.id },
      include: blogDetailInclude,
    });

    revalidateBlogDetail(res.id);

    after(async () => {
      await autoFillMissingTranslations({
        entityType: 'blog',
        entityId: res.id,
        providedTranslations: translations,
      });
    });

    return NextResponse.json(
      {
        success: true,
        data: blog ? mapBlogToResponse(blog, locale, { includeAllTranslations: true }) : null,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error('Failed to create blog', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(req, 'internalError', 500);
  }
}
