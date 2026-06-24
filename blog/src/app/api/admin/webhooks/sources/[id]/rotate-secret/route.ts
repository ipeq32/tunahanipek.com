import { NextResponse } from 'next/server';

import { rotateWebhookSourceSecret } from '@/lib/data/webhooks';
import { requirePrimarySuperAdmin } from '@/lib/auth/guards';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const authContext = await requirePrimarySuperAdmin();
  if (!authContext) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const result = await rotateWebhookSourceSecret(id);
    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    logger.error('Failed to rotate webhook source secret', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to rotate webhook secret' },
      { status: 500 },
    );
  }
}
