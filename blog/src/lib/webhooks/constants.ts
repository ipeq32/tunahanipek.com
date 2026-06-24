export const WEBHOOK_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Gelen webhook gövdesi üst sınırı (byte). */
export const MAX_WEBHOOK_BODY_BYTES = 256 * 1024;

/** Veritabanına yazılacak JSON serileştirme üst sınırı (byte). */
export const MAX_WEBHOOK_STORED_PAYLOAD_BYTES = 128 * 1024;

export const MAX_WEBHOOK_TITLE_LENGTH = 500;
export const MAX_WEBHOOK_EVENT_TYPE_LENGTH = 120;

/** IP başına dakikada genel webhook isteği. */
export const WEBHOOK_RATE_LIMIT_PER_MINUTE = 60;

/** IP başına dakikada kimlik doğrulama denemesi. */
export const WEBHOOK_AUTH_RATE_LIMIT_PER_MINUTE = 20;

export function isValidWebhookSlug(slug: string): boolean {
  return WEBHOOK_SLUG_PATTERN.test(slug) && slug.length <= 48;
}
