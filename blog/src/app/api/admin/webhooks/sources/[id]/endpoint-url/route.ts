import { NextResponse } from 'next/server';

import { getWebhookSourceEndpointUrl } from '@/lib/data/webhooks';
import { requirePrimarySuperAdmin } from '@/lib/auth/guards';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authContext = await requirePrimarySuperAdmin();
  if (!authContext) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const endpointUrl = await getWebhookSourceEndpointUrl(id);
    if (!endpointUrl) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: { endpointUrl } });
  } catch (error) {
    logger.error('Failed to reveal webhook endpoint URL', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to load webhook URL' },
      { status: 500 },
    );
  }
}
