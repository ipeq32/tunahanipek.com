import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const GEO_LIMIT = 30;
const GEO_WINDOW_MS = 60 * 1000;

export function checkAddressGeoRateLimit(request: Request): Response | null {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = checkRateLimit(
    `address-geo:${ip}`,
    GEO_LIMIT,
    GEO_WINDOW_MS
  );

  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(retryAfterMs / 1000)),
        },
      }
    );
  }

  return null;
}
