import { timingSafeEqual } from 'node:crypto';

/**
 * Vercel Cron `Authorization: Bearer ${CRON_SECRET}` gönderir.
 */
export function verifyCronSecret(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return false;
  }

  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return false;
  }

  const provided = header.slice(7).trim();
  if (!provided) {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}
