import { auth } from '@/auth';
import { canAutoPublish, isModerator } from '@/lib/auth-roles';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { syncBlogTaxonomy } from '@/lib/blog-taxonomy';
import { upsertBlogTranslations } from '@/lib/blog-translations';
import { blogListInclude, mapBlogToResponse } from '@/lib/blog-mapper';
import { revalidateBlogDetail } from '@/lib/revalidate-public';
import { createBlogSchema } from '@/lib/validations/blog';
import { apiError, apiMessage } from '@/lib/api-i18n';
import { resolveRequestLocale } from '@/lib/languages';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const locale = await resolveRequestLocale(req);

  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return apiError(req, 'unauthorized', 401);
    }

    if (!isModerator(user.role)) {
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

    const autoPublish = canAutoPublish(user.role);

    const res = await prisma.blog.create({
      data: {
        image,
        shortImage,
        author: {
          connect: { id: user.id },
        },
      },
    });

    await upsertBlogTranslations(res.id, translations, autoPublish);
    await syncBlogTaxonomy(res.id, tags, categories);

    const blog = await prisma.blog.findUnique({
      where: { id: res.id },
      include: blogListInclude,
    });

    revalidateBlogDetail(res.id);

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
