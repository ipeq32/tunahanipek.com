import 'server-only';

import { encryptSecret } from '@/lib/secret-crypto';

const DUMMY_PLAIN_SECRET = '0'.repeat(64);

let cachedDummySecretEnc: string | null = null;

/** Zamanlama/sızıntı saldırılarını zorlaştırmak için sabit sahte secret. */
export function getDummySecretEnc(): string {
  if (!cachedDummySecretEnc) {
    cachedDummySecretEnc = encryptSecret(DUMMY_PLAIN_SECRET);
  }
  return cachedDummySecretEnc;
}
