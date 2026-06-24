import { getWebhookIntegration, normalizeIntegrationKey } from '@/lib/webhooks/integrations/registry';
import type {
  ParsedWebhookEvent,
  WebhookParseContext,
} from '@/lib/webhooks/integrations/types';

export type { ParsedWebhookEvent, WebhookParseContext, WebhookIntegrationDefinition } from '@/lib/webhooks/integrations/types';

export {
  WEBHOOK_INTEGRATION_KEYS,
  getWebhookIntegration,
  isWebhookIntegrationKey,
  listWebhookIntegrations,
  normalizeIntegrationKey,
} from '@/lib/webhooks/integrations/registry';

export function parseWebhookEvent(
  integrationKey: string,
  context: WebhookParseContext,
): ParsedWebhookEvent {
  const integration = getWebhookIntegration(normalizeIntegrationKey(integrationKey));
  return integration.parse(context);
}
