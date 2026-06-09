import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import { logger } from '@/lib/logger';
import {
  getSiteAiSettings,
  upsertSiteAiSettings,
} from '@/lib/site-ai-settings';
import { upsertAiSettingsSchema } from '@/lib/validations/ai-settings';

export const dynamic = 'force-dynamic';

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
    const data = await getSiteAiSettings();
    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Failed to fetch AI settings', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const parsed = upsertAiSettingsSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid payload' },
        { status: 400 },
      );
    }

    const data = await upsertSiteAiSettings(parsed.data);
    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Failed to save AI settings', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
