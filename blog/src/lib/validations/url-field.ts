import { z } from 'zod';

const httpUrl = z.string().trim().url();

/** Form alanları: boş string veya geçerli http(s) URL */
export const optionalUrlField = z.union([z.literal(''), httpUrl]);

/** API güncelleme: boş string, null veya geçerli http(s) URL */
export const optionalNullableUrlField = z.union([
  z.literal(''),
  z.literal(null),
  httpUrl,
]);

export function normalizeExternalUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function toFormUrlValue(value: string | null | undefined): string {
  return value?.trim() ?? '';
}
