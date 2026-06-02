import { auth } from '@/auth';
import { createComment, getApprovedComments } from '@/lib/data/comments';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const schema = z.object({
  content: z.string().min(3).max(2000),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const data = await getApprovedComments(id);
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const data = await createComment(
      blogId,
      session.user.id,
      parsed.data.content
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
