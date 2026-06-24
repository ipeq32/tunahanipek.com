import { NextResponse } from 'next/server';

import {
  createWebhookSource,
  getWebhookDashboardStats,
  listWebhookSources,
} from '@/lib/data/webhooks';
import { requirePrimarySuperAdmin } from '@/lib/auth/guards';
import { logger } from '@/lib/logger';
import { createWebhookSourceSchema } from '@/lib/validations/webhooks';

export const dynamic = 'force-dynamic';

export async function GET() {
  const context = await requirePrimarySuperAdmin();
  if (!context) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const [sources, stats] = await Promise.all([
      listWebhookSources(),
      getWebhookDashboardStats(),
    ]);

    return NextResponse.json({ data: { sources, stats } });
  } catch (error) {
    logger.error('Failed to list webhook sources', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to load webhook sources' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const context = await requirePrimarySuperAdmin();
  if (!context) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const parsed = createWebhookSourceSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid payload' },
        { status: 400 },
      );
    }

    const result = await createWebhookSource(parsed.data);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A source with this slug already exists' },
        { status: 409 },
      );
    }

    logger.error('Failed to create webhook source', { error: message });
    return NextResponse.json(
      { error: 'Failed to create webhook source' },
      { status: 500 },
    );
  }
}
