import type { WebhookIntegrationDefinition } from '@/lib/webhooks/integrations/types';
import {
  asRecord,
  formatEventLabel,
  inferSeverityFromEventType,
  readString,
  readStringFromKeys,
} from '@/lib/webhooks/integrations/shared';

export const gitlabIntegration: WebhookIntegrationDefinition = {
  key: 'gitlab',
  parse({ payload, headers }) {
    const record = asRecord(payload);
    const headerEvent = headers['x-gitlab-event'];

    if (!record) {
      return {
        eventType: headerEvent ?? 'gitlab_event',
        severity: 'INFO',
        title: headerEvent
          ? `GitLab — ${formatEventLabel(headerEvent)}`
          : 'GitLab webhook',
      };
    }

    const eventType =
      headerEvent ??
      readStringFromKeys(record, ['event_name', 'object_kind', 'event']) ??
      'gitlab_event';

    const projectRecord = asRecord(record.project);
    const context =
      (projectRecord ? readString(projectRecord, 'path_with_namespace') : null) ??
      readString(record, 'project_name') ??
      'GitLab';

    return {
      eventType,
      severity: inferSeverityFromEventType(eventType),
      title: `${formatEventLabel(eventType)} — ${context}`,
    };
  },
};
