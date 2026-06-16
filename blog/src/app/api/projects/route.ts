import { getPublishedProjectsPaginated } from '@/lib/data/projects';
import { logger } from '@/lib/logger';
import { apiError } from '@/lib/api-i18n';
import { resolveRequestLocale } from '@/lib/languages';
import { parsePaginationFromRequest } from '@/lib/pagination';
import { PUBLIC_READ_CACHE_HEADERS } from '@/lib/api-cache';
import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET(request: Request) {
  const locale = await resolveRequestLocale(request);

  try {
    const { page, limit } = parsePaginationFromRequest(request);
    const result = await getPublishedProjectsPaginated(locale, page, limit);

    return NextResponse.json(
      {
        data: result.data,
        pagination: result.pagination,
        locale,
      },
      { headers: PUBLIC_READ_CACHE_HEADERS },
    );
  } catch (error) {
    logger.error('Failed to fetch projects', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}
