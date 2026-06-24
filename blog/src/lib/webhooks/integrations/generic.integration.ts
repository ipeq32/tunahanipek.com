import type { WebhookIntegrationDefinition } from '@/lib/webhooks/integrations/types';
import {
  asRecord,
  fallbackParsedEvent,
  formatEventLabel,
  parseSeverity,
  readStringFromKeys,
} from '@/lib/webhooks/integrations/shared';

export const genericIntegration: WebhookIntegrationDefinition = {
  key: 'generic',
  parse({ payload }) {
    const record = asRecord(payload);
    if (!record) {
      return fallbackParsedEvent();
    }

    const eventType =
      readStringFromKeys(record, ['event', 'type', 'action', 'name']) ??
      'webhook_event';

    const title =
      readStringFromKeys(record, ['title', 'message', 'summary', 'subject']) ??
      formatEventLabel(eventType);

    return {
      eventType,
      severity: parseSeverity(record, eventType),
      title,
    };
  },
};
