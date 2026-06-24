import { beforeAll, describe, expect, it } from 'vitest';

import { isValidWebhookSlug } from '@/lib/webhooks/constants';
import { sanitizePayloadForStorage } from '@/lib/webhooks/sanitize-payload';
import { verifyWebhookSecret } from '@/lib/webhooks/verify-secret';
import { encryptSecret } from '@/lib/secret-crypto';

describe('webhook security helpers', () => {
  beforeAll(() => {
    process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-for-webhook-security';
  });

  it('validates webhook slug format', () => {
    expect(isValidWebhookSlug('alicinvar-com')).toBe(true);
    expect(isValidWebhookSlug('INVALID')).toBe(false);
    expect(isValidWebhookSlug('../admin')).toBe(false);
  });

  it('verifies secrets with timing-safe comparison', () => {
    const secret = 'f'.repeat(64);
    const encrypted = encryptSecret(secret);

    expect(verifyWebhookSecret(secret, encrypted)).toBe(true);
    expect(verifyWebhookSecret('0'.repeat(64), encrypted)).toBe(false);
  });

  it('truncates oversized payloads before storage', () => {
    const huge = { data: 'x'.repeat(200_000) };
    const stored = sanitizePayloadForStorage(huge) as {
      _truncated?: boolean;
      preview?: string;
    };

    expect(stored._truncated).toBe(true);
    expect(stored.preview?.length).toBeLessThanOrEqual(4_000);
  });
});
