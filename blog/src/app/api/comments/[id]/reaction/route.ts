import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { toggleCommentReaction } from '@/lib/data/comments';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const schema = z.object({
  type: z.enum(['LIKE', 'DISLIKE']),
});

// Toggle işlemleri sık tetiklenebildiğinden limit cömert tutulur; amaç yalnızca
// otomatikleştirilmiş kötüye kullanımı engellemektir.
const REACTION_LIMIT = 60;
const REACTION_WINDOW_MS = 60 * 1000;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authContext = await requirePermission(PERMISSIONS['comment:react']);
  if (!authContext) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { allowed, retryAfterMs } = checkRateLimit(
    `reaction:${authContext.userId}:${getClientIp(request)}`,
    REACTION_LIMIT,
    REACTION_WINDOW_MS
  );

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
      }
    );
  }

  const { id: commentId } = await context.params;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Validation failed' },
        { status: 400 }
      );
    }

    const summary = await toggleCommentReaction(
      commentId,
      authContext.userId,
      parsed.data.type
    );

    if (!summary) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ data: summary });
  } catch (error) {
    logger.error('Failed to toggle comment reaction', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
