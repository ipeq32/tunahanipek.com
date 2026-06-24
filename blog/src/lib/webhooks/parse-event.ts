import type {
  WebhookEventSeverity,
  WebhookProvider,
} from '@prisma/client';

export type ParsedWebhookEvent = {
  eventType: string;
  severity: WebhookEventSeverity;
  title: string;
};

type PayloadRecord = Record<string, unknown>;

function asRecord(value: unknown): PayloadRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as PayloadRecord;
}

function readString(record: PayloadRecord, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readBoolean(record: PayloadRecord, key: string): boolean | null {
  const value = record[key];
  return typeof value === 'boolean' ? value : null;
}

function formatEventLabel(eventType: string): string {
  return eventType
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function inferSeverityFromSuccess(success: boolean | null): WebhookEventSeverity {
  if (success === true) {
    return 'SUCCESS';
  }
  if (success === false) {
    return 'ERROR';
  }
  return 'INFO';
}

function inferSeverityFromEventType(eventType: string): WebhookEventSeverity {
  const normalized = eventType.toLowerCase();

  if (
    normalized.includes('fail') ||
    normalized.includes('error') ||
    normalized.includes('unreachable') ||
    normalized.includes('outdated')
  ) {
    return 'ERROR';
  }

  if (
    normalized.includes('success') ||
    normalized.includes('reachable') ||
    normalized.includes('completed')
  ) {
    return 'SUCCESS';
  }

  if (
    normalized.includes('warning') ||
    normalized.includes('disk') ||
    normalized.includes('usage')
  ) {
    return 'WARNING';
  }

  return 'INFO';
}

function parseCoolifyEvent(payload: PayloadRecord): ParsedWebhookEvent {
  const eventType =
    readString(payload, 'event') ??
    readString(payload, 'type') ??
    'coolify_event';
  const success = readBoolean(payload, 'success');
  const severity =
    success !== null
      ? inferSeverityFromSuccess(success)
      : inferSeverityFromEventType(eventType);

  const applicationName = readString(payload, 'application_name');
  const project = readString(payload, 'project');
  const serverName = readString(payload, 'server_name');
  const databaseName = readString(payload, 'database_name');
  const message = readString(payload, 'message');

  const context =
    applicationName ??
    databaseName ??
    serverName ??
    project ??
    message ??
    'Coolify';

  const title = `${formatEventLabel(eventType)} — ${context}`;

  return { eventType, severity, title };
}

function parseGenericEvent(payload: PayloadRecord): ParsedWebhookEvent {
  const eventType =
    readString(payload, 'event') ??
    readString(payload, 'type') ??
    readString(payload, 'action') ??
    'webhook_event';

  const success = readBoolean(payload, 'success');
  const severity =
    success !== null
      ? inferSeverityFromSuccess(success)
      : inferSeverityFromEventType(eventType);

  const title =
    readString(payload, 'title') ??
    readString(payload, 'message') ??
    readString(payload, 'summary') ??
    readString(payload, 'subject') ??
    formatEventLabel(eventType);

  return { eventType, severity, title };
}

export function parseWebhookEvent(
  provider: WebhookProvider,
  payload: unknown
): ParsedWebhookEvent {
  const record = asRecord(payload);

  if (!record) {
    return {
      eventType: 'raw_payload',
      severity: 'INFO',
      title: 'Webhook received',
    };
  }

  if (provider === 'COOLIFY') {
    return parseCoolifyEvent(record);
  }

  return parseGenericEvent(record);
}
