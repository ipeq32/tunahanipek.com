import type { WebhookIntegrationDefinition } from '@/lib/webhooks/integrations/types';
import {
  asRecord,
  fallbackParsedEvent,
  formatEventLabel,
  parseSeverity,
  readString,
  readStringFromKeys,
} from '@/lib/webhooks/integrations/shared';

export const coolifyIntegration: WebhookIntegrationDefinition = {
  key: 'coolify',
  parse({ payload }) {
    const record = asRecord(payload);
    if (!record) {
      return fallbackParsedEvent();
    }

    const eventType =
      readStringFromKeys(record, ['event', 'type']) ?? 'coolify_event';

    const context =
      readString(record, 'application_name') ??
      readString(record, 'database_name') ??
      readString(record, 'server_name') ??
      readString(record, 'project') ??
      readString(record, 'message') ??
      'Coolify';

    return {
      eventType,
      severity: parseSeverity(record, eventType),
      title: `${formatEventLabel(eventType)} — ${context}`,
    };
  },
};
