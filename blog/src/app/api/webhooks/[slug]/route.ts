import { NextResponse } from 'next/server';

import {
  getWebhookSourceBySlug,
  recordWebhookEvent,
} from '@/lib/data/webhooks';
import { logger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import {
  extractWebhookSecret,
  verifyWebhookSecret,
} from '@/lib/webhooks/verify-secret';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const clientIp = getClientIp(request);

  const rateLimit = checkRateLimit(`webhook:${slug}:${clientIp}`, 120, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const providedSecret = extractWebhookSecret(request);
  if (!providedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const source = await getWebhookSourceBySlug(slug);
  if (!source || !source.enabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!verifyWebhookSecret(providedSecret, source.secretEnc)) {
    logger.warn('Webhook rejected: invalid secret', {
      slug,
      clientIp,
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;
  const contentType = request.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const text = await request.text();
      if (!text.trim()) {
        payload = { message: 'Empty webhook payload' };
      } else {
        try {
          payload = JSON.parse(text);
        } catch {
          payload = { message: text };
        }
      }
    }
  } catch (error) {
    logger.warn('Webhook payload parse failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const event = await recordWebhookEvent({
      sourceId: source.id,
      provider: source.provider,
      payload,
      headers: request.headers,
      clientIp,
    });

    return NextResponse.json({
      ok: true,
      eventId: event.id,
      eventType: event.eventType,
      severity: event.severity,
      receivedAt: event.receivedAt.toISOString(),
    });
  } catch (error) {
    logger.error('Failed to store webhook event', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
