import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import { getPendingComments, updateCommentStatus } from '@/lib/data/comments';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await getPendingComments();
    return NextResponse.json({ data });
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
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
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
