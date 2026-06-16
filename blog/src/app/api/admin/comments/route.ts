import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { getPendingCommentsPaginated, updateCommentStatus } from '@/lib/data/comments';
import { parsePaginationFromRequest } from '@/lib/pagination';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const context = await requirePermission(PERMISSIONS['comment:moderate']);
  if (!context) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { page, limit } = parsePaginationFromRequest(request);
    const result = await getPendingCommentsPaginated(page, limit);

    return NextResponse.json({
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Failed to fetch pending comments', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['APPROVED', 'REJECTED']),
});

export async function PATCH(request: Request) {
  const context = await requirePermission(PERMISSIONS['comment:moderate']);
  if (!context) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    await updateCommentStatus(parsed.data.id, parsed.data.status);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to update comment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
