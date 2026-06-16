import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { getAdminUsersPaginated } from '@/lib/data/users';
import { logger } from '@/lib/logger';
import { parsePaginationFromRequest } from '@/lib/pagination';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const context = await requirePermission(PERMISSIONS['user:read']);
  if (!context) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { page, limit } = parsePaginationFromRequest(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? undefined;
    const accessRoleId = searchParams.get('accessRoleId') ?? undefined;

    const result = await getAdminUsersPaginated(page, limit, {
      search,
      accessRoleId,
    });

    return NextResponse.json({
      data: result.data,
      pagination: result.pagination,
      stats: result.stats,
    });
  } catch (error) {
    logger.error('Failed to fetch admin users', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
