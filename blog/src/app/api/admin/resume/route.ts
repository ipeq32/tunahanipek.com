import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import {
  clearSiteResume,
  getSiteResume,
  upsertSiteResume,
} from '@/lib/site-resume';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const upsertSchema = z.object({
  url: z.string().url(),
  fileName: z
    .string()
    .min(1)
    .max(255)
    .regex(/\.pdf$/i, 'File name must end with .pdf'),
});

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const resume = await getSiteResume();

    if (!resume) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: {
        url: resume.url,
        fileName: resume.fileName,
        updatedAt: resume.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch admin resume', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = upsertSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid payload' },
        { status: 400 }
      );
    }

    const resume = await upsertSiteResume(parsed.data);

    return NextResponse.json({
      data: {
        url: resume.url,
        fileName: resume.fileName,
        updatedAt: resume.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to save resume', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await clearSiteResume();
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Failed to delete resume', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
