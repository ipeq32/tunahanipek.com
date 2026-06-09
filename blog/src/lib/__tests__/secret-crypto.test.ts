import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  decryptSecret,
  encryptSecret,
  maskSecret,
} from '@/lib/secret-crypto';

describe('secret-crypto', () => {
  const originalSecret = process.env.NEXTAUTH_SECRET;

  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = 'test-secret-for-encryption';
  });

  afterEach(() => {
    process.env.NEXTAUTH_SECRET = originalSecret;
  });

  it('encrypts and decrypts values', () => {
    const encoded = encryptSecret('my-api-key-1234');
    expect(decryptSecret(encoded)).toBe('my-api-key-1234');
  });

  it('masks secrets', () => {
    expect(maskSecret('abcdefghij')).toBe('••••ghij');
  });
});
