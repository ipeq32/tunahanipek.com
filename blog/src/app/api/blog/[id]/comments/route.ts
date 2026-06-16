import { auth } from '@/auth';
import {
  createComment,
  getApprovedCommentViewsPaginated,
  isValidReplyParent,
} from '@/lib/data/comments';
import { parsePaginationFromRequest } from '@/lib/pagination';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { resolveRequestLocale } from '@/lib/languages';

export const dynamic = 'force-dynamic';

const schema = z.object({
  content: z.string().min(3).max(2000),
  parentId: z.string().uuid().optional(),
});

const COMMENT_LIMIT = 5;
const COMMENT_WINDOW_MS = 10 * 60 * 1000;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await auth();

  try {
    const locale = await resolveRequestLocale(request);
    const { page, limit } = parsePaginationFromRequest(request);
    const result = await getApprovedCommentViewsPaginated(
      id,
      locale,
      page,
      limit,
      session?.user?.id
    );

    return NextResponse.json({
      data: result.data,
      pagination: result.pagination,
    });
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
