import { NextResponse } from 'next/server';

import { updateWebhookEventStatus } from '@/lib/data/webhooks';
import { requirePrimarySuperAdmin } from '@/lib/auth/guards';
import { logger } from '@/lib/logger';
import { updateWebhookEventSchema } from '@/lib/validations/webhooks';

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
    const parsed = updateWebhookEventSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid payload' },
        { status: 400 },
      );
    }

    const event = await updateWebhookEventStatus(id, parsed.data.status);
    if (!event) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: event });
  } catch (error) {
    logger.error('Failed to update webhook event', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to update webhook event' },
      { status: 500 },
    );
  }
}
