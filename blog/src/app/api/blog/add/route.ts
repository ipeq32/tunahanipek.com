import { auth } from '@/auth';
import { canAutoPublish, isModerator } from '@/lib/auth-roles';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { sanitizeHtml } from '@/lib/sanitize';
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

    const { content, image, shortImage, summary, title } = await req.json();

    if (!title || !content || !summary || !image || !shortImage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
