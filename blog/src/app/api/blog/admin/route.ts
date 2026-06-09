import { auth } from '@/auth';
import { getAdminBlogs } from '@/lib/data/blogs';
import { isSuperAdmin } from '@/lib/auth-roles';
import { logger } from '@/lib/logger';
import { apiError } from '@/lib/api-i18n';
import { resolveRequestLocale } from '@/lib/languages';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user || !isSuperAdmin(user.role)) {
    return apiError(request, 'forbidden', 403);
  }

  try {
    const locale = await resolveRequestLocale(request);
    const blogs = await getAdminBlogs(locale);

    return NextResponse.json({
      data: blogs,
      locale,
    });
  } catch (error) {
    logger.error('Failed to fetch admin blogs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}
