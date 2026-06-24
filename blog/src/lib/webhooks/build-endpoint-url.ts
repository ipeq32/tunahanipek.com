function getWebhookPublicBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    'http://localhost:3000'
  );
}

export function buildWebhookEndpointUrl(slug: string, secret: string): string {
  const url = new URL(
    `/api/webhooks/${encodeURIComponent(slug)}`,
    getWebhookPublicBaseUrl(),
  );
  url.searchParams.set('key', secret);
  return url.toString();
}

export function maskWebhookKeyForDisplay(secret: string): string {
  const trimmed = secret.trim();
  if (trimmed.length <= 4) {
    return '****';
  }
  return `****${trimmed.slice(-4)}`;
}

export function buildWebhookEndpointPath(slug: string): string {
  return `${getWebhookPublicBaseUrl()}/api/webhooks/${encodeURIComponent(slug)}`;
}

export function formatWebhookEndpointDisplay(slug: string, secret: string): {
  path: string;
  queryHint: string;
  maskedUrl: string;
} {
  const path = buildWebhookEndpointPath(slug);
  const queryHint = `?key=${maskWebhookKeyForDisplay(secret)}`;

  return {
    path,
    queryHint,
    maskedUrl: `${path}${queryHint}`,
  };
}
