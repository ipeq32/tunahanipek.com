import type { WebhookEventSeverity } from '@prisma/client';

export type ParsedWebhookEvent = {
  eventType: string;
  severity: WebhookEventSeverity;
  title: string;
};

export type WebhookParseContext = {
  payload: unknown;
  headers: Record<string, string>;
};

export type WebhookIntegrationDefinition = {
  /** Benzersiz entegrasyon anahtarı (URL slug gibi, küçük harf). */
  key: string;
  parse: (context: WebhookParseContext) => ParsedWebhookEvent;
};
