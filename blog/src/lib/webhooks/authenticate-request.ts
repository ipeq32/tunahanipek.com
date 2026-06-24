import 'server-only';

import { getWebhookSourceBySlug } from '@/lib/data/webhooks';
import { isValidWebhookSlug } from '@/lib/webhooks/constants';
import { getDummySecretEnc } from '@/lib/webhooks/dummy-secret';
import { verifyWebhookSecret } from '@/lib/webhooks/verify-secret';

type AuthenticatedWebhookSource = NonNullable<
  Awaited<ReturnType<typeof getWebhookSourceBySlug>>
>;

/**
 * Geçersiz slug, devre dışı kaynak veya yanlış secret için aynı sonucu döner.
 * Slug varlığını dışarı sızdırmamak için her durumda sabit zamanlı doğrulama yapılır.
 */
export async function authenticateWebhookRequest(
  slug: string,
  providedSecret: string,
): Promise<AuthenticatedWebhookSource | null> {
  if (!isValidWebhookSlug(slug)) {
    verifyWebhookSecret(providedSecret, getDummySecretEnc());
    return null;
  }

  const source = await getWebhookSourceBySlug(slug);
  const secretEnc =
    source?.enabled === true ? source.secretEnc : getDummySecretEnc();
  const isValid = verifyWebhookSecret(providedSecret, secretEnc);

  if (!isValid || !source?.enabled) {
    return null;
  }

  return source;
}
