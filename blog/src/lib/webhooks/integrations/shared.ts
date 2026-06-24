import type { WebhookEventSeverity } from '@prisma/client';

export type PayloadRecord = Record<string, unknown>;

export function asRecord(value: unknown): PayloadRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as PayloadRecord;
}

export function readString(record: PayloadRecord, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function readBoolean(record: PayloadRecord, key: string): boolean | null {
  const value = record[key];
  return typeof value === 'boolean' ? value : null;
}

export function readStringFromKeys(
  record: PayloadRecord,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = readString(record, key);
    if (value) {
      return value;
    }
  }
  return null;
}

export function formatEventLabel(eventType: string): string {
  return eventType
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function inferSeverityFromSuccess(
  success: boolean | null,
): WebhookEventSeverity {
  if (success === true) {
    return 'SUCCESS';
  }
  if (success === false) {
    return 'ERROR';
  }
  return 'INFO';
}

export function inferSeverityFromEventType(
  eventType: string,
): WebhookEventSeverity {
  const normalized = eventType.toLowerCase();

  if (
    normalized.includes('fail') ||
    normalized.includes('error') ||
    normalized.includes('unreachable') ||
    normalized.includes('outdated') ||
    normalized.includes('down') ||
    normalized.includes('critical')
  ) {
    return 'ERROR';
  }

  if (
    normalized.includes('success') ||
    normalized.includes('reachable') ||
    normalized.includes('completed') ||
    normalized.includes('up') ||
    normalized.includes('resolved')
  ) {
    return 'SUCCESS';
  }

  if (
    normalized.includes('warning') ||
    normalized.includes('disk') ||
    normalized.includes('usage') ||
    normalized.includes('degraded')
  ) {
    return 'WARNING';
  }

  return 'INFO';
}

export function parseSeverity(
  record: PayloadRecord,
  eventType: string,
): WebhookEventSeverity {
  const explicit = readString(record, 'severity')?.toUpperCase();
  if (
    explicit === 'INFO' ||
    explicit === 'SUCCESS' ||
    explicit === 'WARNING' ||
    explicit === 'ERROR'
  ) {
    return explicit;
  }

  const success = readBoolean(record, 'success');
  if (success !== null) {
    return inferSeverityFromSuccess(success);
  }

  return inferSeverityFromEventType(eventType);
}

export function fallbackParsedEvent(): {
  eventType: string;
  severity: WebhookEventSeverity;
  title: string;
} {
  return {
    eventType: 'raw_payload',
    severity: 'INFO',
    title: 'Webhook received',
  };
}
