import type { WebhookIntegrationDefinition } from '@/lib/webhooks/integrations/types';
import {
  asRecord,
  fallbackParsedEvent,
  formatEventLabel,
  inferSeverityFromEventType,
  readString,
  readStringFromKeys,
} from '@/lib/webhooks/integrations/shared';

export const githubIntegration: WebhookIntegrationDefinition = {
  key: 'github',
  parse({ payload, headers }) {
    const record = asRecord(payload);
    const headerEvent = headers['x-github-event'];

    if (!record) {
      return {
        eventType: headerEvent ?? 'github_event',
        severity: 'INFO',
        title: headerEvent
          ? `GitHub — ${formatEventLabel(headerEvent)}`
          : 'GitHub webhook',
      };
    }

    const action = readString(record, 'action');
    const eventType = headerEvent
      ? action
        ? `${headerEvent}.${action}`
        : headerEvent
      : (readStringFromKeys(record, ['event', 'type']) ?? 'github_event');

    const repoRecord = asRecord(record.repository);
    const repoName = repoRecord ? readString(repoRecord, 'full_name') : null;

    const senderRecord = asRecord(record.sender);
    const actor = senderRecord ? readString(senderRecord, 'login') : null;

    const context = repoName ?? actor ?? 'GitHub';
    const severity = inferSeverityFromEventType(eventType);

    return {
      eventType,
      severity,
      title: `${formatEventLabel(eventType)} — ${context}`,
    };
  },
};
