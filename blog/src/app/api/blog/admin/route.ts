import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { getAdminBlogsPaginated } from '@/lib/data/blogs';
import { logger } from '@/lib/logger';
import { apiError } from '@/lib/api-i18n';
import { resolveRequestLocale } from '@/lib/languages';
import { parsePaginationFromRequest } from '@/lib/pagination';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type StatusFilter = 'all' | 'published' | 'drafts';

function parseStatusFilter(value: string | null): StatusFilter {
  if (value === 'published' || value === 'drafts') {
    return value;
  }
  return 'all';
}

export async function GET(request: Request) {
  const context = await requirePermission(PERMISSIONS['blog:admin-list']);
  if (!context) {
    return apiError(request, 'forbidden', 403);
  }

  try {
    const locale = await resolveRequestLocale(request);
    const { page, limit } = parsePaginationFromRequest(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? undefined;
    const status = parseStatusFilter(searchParams.get('status'));

    const result = await getAdminBlogsPaginated(locale, page, limit, {
      search,
      status,
    });

    return NextResponse.json({
      data: result.data,
      pagination: result.pagination,
      stats: result.stats,
      locale,
    });
  } catch (error) {
    logger.error('Failed to fetch admin blogs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}
