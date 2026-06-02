import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { blogListInclude, mapBlogToResponse } from '@/lib/blog-mapper';
import { syncBlogTaxonomy } from '@/lib/blog-taxonomy';
import { isModerator, isSuperAdmin } from '@/lib/auth-roles';
import { logger } from '@/lib/logger';
import { sanitizeHtml } from '@/lib/sanitize';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Params = {
  id: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;

  try {
    const blog = await prisma.blog.findUnique({
      where: {
        id,
        deletedAt: null,
        published: true,
      },
      include: blogListInclude,
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ data: mapBlogToResponse(blog) }, { status: 200 });
  } catch (error) {
    logger.error('Failed to fetch blog', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  const session = await auth();
  const user = session?.user;

  if (!user || !isModerator(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const existing = await prisma.blog.findUnique({ where: { id } });

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const isOwner = existing.authorId === user.id;
    if (!isSuperAdmin(user.role) && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data: {
      title?: string;
      content?: string;
      summary?: string;
      image?: string;
      shortImage?: string;
      published?: boolean;
    } = {};

    if (typeof body.title === 'string') data.title = body.title;
    if (typeof body.image === 'string') data.image = body.image;
    if (typeof body.shortImage === 'string') data.shortImage = body.shortImage;
    if (typeof body.summary === 'string') {
      data.summary = sanitizeHtml(body.summary);
    }
    if (typeof body.content === 'string') {
      data.content = sanitizeHtml(body.content);
    }
    if (typeof body.published === 'boolean' && isSuperAdmin(user.role)) {
      data.published = body.published;
    }

    const updated = await prisma.blog.update({
      where: { id },
      data,
      include: blogListInclude,
    });

    if (typeof body.tags === 'string' || typeof body.categories === 'string') {
      await syncBlogTaxonomy(
        id,
        typeof body.tags === 'string' ? body.tags : undefined,
        typeof body.categories === 'string' ? body.categories : undefined
      );
    }

    const withTaxonomy = await prisma.blog.findUnique({
      where: { id },
      include: blogListInclude,
    });

    return NextResponse.json({
      data: mapBlogToResponse(withTaxonomy ?? updated),
    });
  } catch (error) {
    logger.error('Failed to update blog', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  const session = await auth();
  const user = session?.user;

  if (!user || !isModerator(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const existing = await prisma.blog.findUnique({ where: { id } });

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const isOwner = existing.authorId === user.id;
    if (!isSuperAdmin(user.role) && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.blog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete blog', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
