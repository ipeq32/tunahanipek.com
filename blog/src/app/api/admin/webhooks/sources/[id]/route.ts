import { NextResponse } from 'next/server';

import {
  deleteWebhookSource,
  updateWebhookSource,
} from '@/lib/data/webhooks';
import { requirePrimarySuperAdmin } from '@/lib/auth/guards';
import { logger } from '@/lib/logger';
import { updateWebhookSourceSchema } from '@/lib/validations/webhooks';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await requirePrimarySuperAdmin();
  if (!authContext) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const parsed = updateWebhookSourceSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid payload' },
        { status: 400 },
      );
    }

    const source = await updateWebhookSource(id, parsed.data);
    if (!source) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: source });
  } catch (error) {
    logger.error('Failed to update webhook source', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to update webhook source' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authContext = await requirePrimarySuperAdmin();
  if (!authContext) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const deleted = await deleteWebhookSource(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Failed to delete webhook source', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to delete webhook source' },
      { status: 500 },
    );
  }
}
