import { auth } from '@/auth';
import { getAdminBlogs } from '@/lib/data/blogs';
import { isSuperAdmin } from '@/lib/auth-roles';
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
    const blogs = await getAdminBlogs();

    return NextResponse.json({
      data: blogs,
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
