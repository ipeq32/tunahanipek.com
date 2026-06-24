import { NextResponse } from 'next/server';

import { recordWebhookEvent } from '@/lib/data/webhooks';
import { logger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { authenticateWebhookRequest } from '@/lib/webhooks/authenticate-request';
import {
  WEBHOOK_AUTH_RATE_LIMIT_PER_MINUTE,
  WEBHOOK_RATE_LIMIT_PER_MINUTE,
} from '@/lib/webhooks/constants';
import {
  readWebhookBody,
  WebhookBodyTooLargeError,
} from '@/lib/webhooks/read-body';
import { sanitizePayloadForStorage } from '@/lib/webhooks/sanitize-payload';
import { extractWebhookSecret } from '@/lib/webhooks/verify-secret';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function parseWebhookPayload(body: string, contentType: string): unknown {
  if (!body.trim()) {
    return { message: 'Empty webhook payload' };
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(body) as unknown;
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return { message: body };
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const clientIp = getClientIp(request);

  const authRateLimit = checkRateLimit(
    `webhook:auth:${clientIp}`,
    WEBHOOK_AUTH_RATE_LIMIT_PER_MINUTE,
    60_000,
  );
  if (!authRateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const rateLimit = checkRateLimit(
    `webhook:${slug}:${clientIp}`,
    WEBHOOK_RATE_LIMIT_PER_MINUTE,
    60_000,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const providedSecret = extractWebhookSecret(request);
  if (!providedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const source = await authenticateWebhookRequest(slug, providedSecret);
  if (!source) {
    logger.warn('Webhook rejected: authentication failed', { clientIp });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;
  const contentType = request.headers.get('content-type') ?? '';

  try {
    const body = await readWebhookBody(request);
    payload = sanitizePayloadForStorage(parseWebhookPayload(body, contentType));
  } catch (error) {
    if (error instanceof WebhookBodyTooLargeError) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    logger.warn('Webhook payload parse failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const event = await recordWebhookEvent({
      sourceId: source.id,
      integrationKey: source.integrationKey,
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
