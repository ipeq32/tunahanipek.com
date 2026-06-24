import type { Prisma } from '@prisma/client';

import {
  MAX_WEBHOOK_EVENT_TYPE_LENGTH,
  MAX_WEBHOOK_STORED_PAYLOAD_BYTES,
  MAX_WEBHOOK_TITLE_LENGTH,
} from '@/lib/webhooks/constants';
import type { ParsedWebhookEvent } from '@/lib/webhooks/parse-event';

export function clampWebhookEventFields(
  parsed: ParsedWebhookEvent,
): ParsedWebhookEvent {
  return {
    eventType: parsed.eventType.slice(0, MAX_WEBHOOK_EVENT_TYPE_LENGTH),
    severity: parsed.severity,
    title: parsed.title.slice(0, MAX_WEBHOOK_TITLE_LENGTH),
  };
}

export function sanitizePayloadForStorage(payload: unknown): Prisma.InputJsonValue {
  try {
    const serialized = JSON.stringify(payload);
    if (serialized.length <= MAX_WEBHOOK_STORED_PAYLOAD_BYTES) {
      return payload as Prisma.InputJsonValue;
    }

    return {
      _truncated: true,
      _originalBytes: serialized.length,
      preview: serialized.slice(0, 4_000),
    };
  } catch {
    return {
      _truncated: true,
      preview: String(payload).slice(0, 4_000),
    };
  }
}
