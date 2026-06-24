const ALLOWED_HEADERS = new Set([
  'content-type',
  'user-agent',
  'x-forwarded-for',
  'x-real-ip',
  'x-coolify-event',
  'x-github-event',
  'x-gitlab-event',
]);

const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'x-webhook-secret',
]);

export function sanitizeWebhookHeaders(
  headers: Headers
): Record<string, string> {
  const result: Record<string, string> = {};

  headers.forEach((value, key) => {
    const normalized = key.toLowerCase();
    if (SENSITIVE_HEADERS.has(normalized)) {
      return;
    }
    if (!ALLOWED_HEADERS.has(normalized)) {
      return;
    }
    result[normalized] = value;
  });

  return result;
}
