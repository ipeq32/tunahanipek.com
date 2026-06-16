import { NextResponse } from 'next/server';

import { canAccessAdminPanel } from '@/lib/auth-roles';
import { requireAuth } from '@/lib/auth/guards';
import { getAdminDashboardStats } from '@/lib/data/admin-stats';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const context = await requireAuth();
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (
    !canAccessAdminPanel(context.permissions, context.session.user?.email)
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') ?? undefined;
    const data = await getAdminDashboardStats(locale);

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Failed to load admin dashboard stats', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to load statistics' },
      { status: 500 },
    );
  }
}
