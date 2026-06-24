import type { WebhookIntegrationDefinition } from '@/lib/webhooks/integrations/types';
import {
  asRecord,
  fallbackParsedEvent,
  formatEventLabel,
  parseSeverity,
  readString,
  readStringFromKeys,
} from '@/lib/webhooks/integrations/shared';

export const grafanaIntegration: WebhookIntegrationDefinition = {
  key: 'grafana',
  parse({ payload }) {
    const record = asRecord(payload);
    if (!record) {
      return fallbackParsedEvent();
    }

    const alerts = Array.isArray(record.alerts) ? record.alerts : [];
    const firstAlert = asRecord(alerts[0]);

    const eventType =
      readStringFromKeys(record, ['state', 'status', 'event']) ??
      (firstAlert ? readString(firstAlert, 'status') : null) ??
      'grafana_alert';

    const title =
      readStringFromKeys(record, ['title', 'message']) ??
      (firstAlert ? readString(firstAlert, 'labels.alertname') : null) ??
      (firstAlert && asRecord(firstAlert.labels)
        ? readString(firstAlert.labels as Record<string, unknown>, 'alertname')
        : null) ??
      formatEventLabel(eventType);

    return {
      eventType,
      severity: parseSeverity(record, eventType),
      title,
    };
  },
};
