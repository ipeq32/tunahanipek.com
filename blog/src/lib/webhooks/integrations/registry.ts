import { coolifyIntegration } from '@/lib/webhooks/integrations/coolify.integration';
import { genericIntegration } from '@/lib/webhooks/integrations/generic.integration';
import { githubIntegration } from '@/lib/webhooks/integrations/github.integration';
import { gitlabIntegration } from '@/lib/webhooks/integrations/gitlab.integration';
import { grafanaIntegration } from '@/lib/webhooks/integrations/grafana.integration';
import { uptimeKumaIntegration } from '@/lib/webhooks/integrations/uptime-kuma.integration';
import type { WebhookIntegrationDefinition } from '@/lib/webhooks/integrations/types';

const INTEGRATIONS: WebhookIntegrationDefinition[] = [
  genericIntegration,
  coolifyIntegration,
  githubIntegration,
  gitlabIntegration,
  uptimeKumaIntegration,
  grafanaIntegration,
];

const integrationMap = new Map(
  INTEGRATIONS.map((integration) => [integration.key, integration]),
);

export const WEBHOOK_INTEGRATION_KEYS = INTEGRATIONS.map(
  (integration) => integration.key,
) as readonly string[];

export type WebhookIntegrationKey = (typeof WEBHOOK_INTEGRATION_KEYS)[number];

export function listWebhookIntegrations(): WebhookIntegrationDefinition[] {
  return INTEGRATIONS;
}

export function getWebhookIntegration(
  key: string,
): WebhookIntegrationDefinition {
  return integrationMap.get(key) ?? genericIntegration;
}

export function isWebhookIntegrationKey(
  key: string,
): key is WebhookIntegrationKey {
  return integrationMap.has(key);
}

/** Eski enum değerlerini yeni anahtarlara eşler. */
export function normalizeIntegrationKey(key: string): string {
  const normalized = key.trim().toLowerCase().replace(/_/g, '-');
  const legacyMap: Record<string, string> = {
    generic: 'generic',
    coolify: 'coolify',
  };

  return legacyMap[normalized] ?? normalized;
}
