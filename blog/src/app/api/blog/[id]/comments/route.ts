import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import {
  createComment,
  getApprovedComments,
  isValidReplyParent,
} from '@/lib/data/comments';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const schema = z.object({
  content: z.string().min(3).max(2000),
  parentId: z.string().uuid().optional(),
});

const COMMENT_LIMIT = 5;
const COMMENT_WINDOW_MS = 10 * 60 * 1000;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await auth();

  try {
    const data = await getApprovedComments(id, session?.user?.id);
    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Failed to fetch comments', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authContext = await requirePermission(PERMISSIONS['comment:create']);
  if (!authContext) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { allowed, retryAfterMs } = checkRateLimit(
    `comment:${authContext.userId}:${getClientIp(request)}`,
    COMMENT_LIMIT,
    COMMENT_WINDOW_MS
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

  const { id: blogId } = await context.params;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Validation failed' },
        { status: 400 }
      );
    }

    const { content, parentId } = parsed.data;

    // Yanıt isteklerinde üst yorumun bu bloğa ait, onaylı ve üst seviye
    // olduğunu doğrulayarak geçersiz/çapraz referansları reddederiz.
    if (parentId && !(await isValidReplyParent(parentId, blogId))) {
      return NextResponse.json(
        { error: 'Invalid parent comment' },
        { status: 400 }
      );
    }

    const data = await createComment(
      blogId,
      authContext.userId,
      content,
      parentId
    );

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create comment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
