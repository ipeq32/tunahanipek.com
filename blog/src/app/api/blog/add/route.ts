import { auth } from '@/auth';
import { canAutoPublish, isModerator } from '@/lib/auth-roles';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { sanitizeHtml } from '@/lib/sanitize';
import { syncBlogTaxonomy } from '@/lib/blog-taxonomy';
import { revalidateBlogDetail } from '@/lib/revalidate-public';
import { createBlogSchema } from '@/lib/validations/blog';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isModerator(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parsed = createBlogSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Validation failed' },
        { status: 400 }
      );
    }

    const { content, image, shortImage, summary, title, tags, categories } =
      parsed.data;

    const res = await prisma.blog.create({
      data: {
        title,
        image,
        shortImage,
        content: sanitizeHtml(content),
        summary: sanitizeHtml(summary),
        published: canAutoPublish(user.role),
        author: {
          connect: { id: user.id },
        },
      },
    });

    await syncBlogTaxonomy(res.id, tags, categories);

    revalidateBlogDetail(res.id);

    return NextResponse.json({ success: true, data: res }, { status: 200 });
  } catch (error) {
    logger.error('Failed to create blog', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
