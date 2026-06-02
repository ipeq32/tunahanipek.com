import { auth } from '@/auth';
import { blogListInclude, mapBlogToResponse } from '@/lib/blog-mapper';
import { isSuperAdmin } from '@/lib/auth-roles';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  const user = session?.user;

  if (!user || !isSuperAdmin(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const blogs = await prisma.blog.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: blogListInclude,
    });

    return NextResponse.json({
      data: blogs.map(mapBlogToResponse),
    });
  } catch (error) {
    logger.error('Failed to fetch admin blogs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
