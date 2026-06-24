import { timingSafeEqual } from 'node:crypto';

import { decryptSecret } from '@/lib/secret-crypto';

export function extractWebhookSecret(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      return token;
    }
  }

  const headerSecret = request.headers.get('x-webhook-secret')?.trim();
  if (headerSecret) {
    return headerSecret;
  }

  const url = new URL(request.url);
  const querySecret = url.searchParams.get('key')?.trim();
  if (querySecret) {
    return querySecret;
  }

  return null;
}

export function verifyWebhookSecret(
  provided: string,
  encryptedSecret: string
): boolean {
  try {
    const expected = decryptSecret(encryptedSecret);
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
