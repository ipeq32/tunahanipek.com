import { NextResponse } from 'next/server';

import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { reorderAdminProjects } from '@/lib/data/projects';
import { logger } from '@/lib/logger';
import { revalidateProjectList } from '@/lib/revalidate-public';
import { reorderProjectsSchema } from '@/lib/validations/project';
import { apiError } from '@/lib/api-i18n';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  const context = await requirePermission(PERMISSIONS['project:update']);
  if (!context) {
    return apiError(request, 'forbidden', 403);
  }

  try {
    const body = await request.json();
    const parsed = reorderProjectsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await reorderAdminProjects(parsed.data.orderedIds);
    revalidateProjectList();

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to reorder projects', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}
