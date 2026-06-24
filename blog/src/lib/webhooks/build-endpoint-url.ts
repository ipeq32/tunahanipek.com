import { maskSecret } from '@/lib/secret-crypto';

export function buildWebhookEndpointUrl(slug: string, secret: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    'http://localhost:3000';

  const url = new URL(`/api/webhooks/${encodeURIComponent(slug)}`, baseUrl);
  url.searchParams.set('key', secret);
  return url.toString();
}

export function maskWebhookEndpointUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const key = parsed.searchParams.get('key');

    if (key) {
      parsed.searchParams.set('key', maskSecret(key));
    }

    return parsed.toString();
  } catch {
    return url;
  }
}
