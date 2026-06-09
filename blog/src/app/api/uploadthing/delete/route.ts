import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { deleteUploadedFiles } from '@/lib/uploadthing-server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const schema = z.object({
  urls: z.array(z.string().url()).min(1).max(10),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const urls = Array.isArray(body?.urls)
      ? body.urls.filter(
          (url: unknown): url is string =>
            typeof url === 'string' && url.trim().length > 0,
        )
      : [];

    const parsed = schema.safeParse({ urls });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Validation failed' },
        { status: 400 }
      );
    }

    await deleteUploadedFiles(parsed.data.urls);

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Delete upload request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
