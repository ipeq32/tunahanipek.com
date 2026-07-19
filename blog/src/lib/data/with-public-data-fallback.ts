import { logger } from '@/lib/logger';

export type PublicDataResult<T> = {
  value: T;
  /** true ise sorgu DB/altyapı hatası nedeniyle fallback döndü; içerik silinmiş değildir. */
  unavailable: boolean;
};

/**
 * Public Server Component sorgularında DB kesintisini sayfa çöküşüne çevirme.
 * Hata loglanır; çağıran boş liste yerine "geçici olarak yüklenemiyor" gösterebilir.
 */
export async function withPublicDataFallback<T>(
  label: string,
  query: () => Promise<T>,
  fallback: T,
): Promise<PublicDataResult<T>> {
  try {
    return { value: await query(), unavailable: false };
  } catch (error) {
    logger.error(`Public data query failed: ${label}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return { value: fallback, unavailable: true };
  }
}
