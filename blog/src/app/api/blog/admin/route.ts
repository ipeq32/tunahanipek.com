import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { getAdminBlogs } from '@/lib/data/blogs';
import { logger } from '@/lib/logger';
import { apiError } from '@/lib/api-i18n';
import { resolveRequestLocale } from '@/lib/languages';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const context = await requirePermission(PERMISSIONS['blog:admin-list']);
  if (!context) {
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
