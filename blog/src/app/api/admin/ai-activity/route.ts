import { NextResponse } from 'next/server';

import { canAccessAdminPanel } from '@/lib/auth-roles';
import { requireAuth } from '@/lib/auth/guards';
import { getAiUsageLogsPaginated } from '@/lib/data/admin-stats';
import { logger } from '@/lib/logger';
import { parsePaginationFromRequest } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const context = await requireAuth();
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canAccessAdminPanel(context.permissions, context.session.user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { page, limit } = parsePaginationFromRequest(request);
    const result = await getAiUsageLogsPaginated(page, limit);

    return NextResponse.json({
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Failed to load AI activity logs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to load AI activity' },
      { status: 500 },
    );
  }
}
