import { NextResponse } from 'next/server';

import {
  listWebhookEvents,
  markAllWebhookEventsRead,
} from '@/lib/data/webhooks';
import { requirePrimarySuperAdmin } from '@/lib/auth/guards';
import { logger } from '@/lib/logger';
import { listWebhookEventsSchema } from '@/lib/validations/webhooks';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const context = await requirePrimarySuperAdmin();
  if (!context) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = listWebhookEventsSchema.safeParse({
      page: searchParams.get('page') ?? undefined,
        pageSize: searchParams.get('pageSize') ?? searchParams.get('limit') ?? undefined,
      sourceId: searchParams.get('sourceId') ?? undefined,
      severity: searchParams.get('severity') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid query' },
        { status: 400 },
      );
    }

    const result = await listWebhookEvents(parsed.data);
    return NextResponse.json({ data: result });
  } catch (error) {
    logger.error('Failed to list webhook events', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to load webhook events' },
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
    const body = (await request.json()) as { sourceId?: string };
    const count = await markAllWebhookEventsRead(body.sourceId);
    return NextResponse.json({ data: { count } });
  } catch (error) {
    logger.error('Failed to mark webhook events as read', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to update webhook events' },
      { status: 500 },
    );
  }
}
