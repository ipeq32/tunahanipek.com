import type { WebhookIntegrationDefinition } from '@/lib/webhooks/integrations/types';
import {
  asRecord,
  fallbackParsedEvent,
  formatEventLabel,
  readBoolean,
  readString,
  readStringFromKeys,
} from '@/lib/webhooks/integrations/shared';

export const uptimeKumaIntegration: WebhookIntegrationDefinition = {
  key: 'uptime-kuma',
  parse({ payload }) {
    const record = asRecord(payload);
    if (!record) {
      return fallbackParsedEvent();
    }

    const monitor = readStringFromKeys(record, ['monitor', 'name', 'monitorName']);
    const status = readString(record, 'status') ?? readString(record, 'msg');
    const isDown = readBoolean(record, 'heartbeat') === false;

    const eventType =
      readStringFromKeys(record, ['event', 'type']) ??
      (isDown || status?.toLowerCase().includes('down')
        ? 'monitor_down'
        : 'monitor_up');

    const severity =
      eventType.includes('down') || isDown
        ? 'ERROR'
        : eventType.includes('up')
          ? 'SUCCESS'
          : 'WARNING';

    const context = monitor ?? status ?? 'Uptime Kuma';

    return {
      eventType,
      severity,
      title: `${formatEventLabel(eventType)} — ${context}`,
    };
  },
};
