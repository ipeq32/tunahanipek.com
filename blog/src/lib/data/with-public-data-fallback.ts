import { logger } from '@/lib/logger';
import { loadPublicSnapshot } from '@/lib/public-snapshot/load';
import type { PublicSnapshot } from '@/lib/public-snapshot/types';

export type PublicDataResult<T> = {
  value: T;
  /** true ise sorgu DB/altyapı hatası nedeniyle fallback döndü; içerik silinmiş değildir. */
  unavailable: boolean;
  /** true ise değer public snapshot’tan geldi. */
  fromSnapshot?: boolean;
};

type FallbackOptions<T> = {
  /**
   * DB fail olunca UploadThing public snapshot’tan değer üret.
   * null/undefined dönerse statik fallback kullanılır.
   */
  fromSnapshot?: (snapshot: PublicSnapshot) => T | null | undefined;
};

/**
 * Public Server Component sorgularında DB kesintisini sayfa çöküşüne çevirme.
 * Opsiyonel olarak son public snapshot’a düşer.
 */
export async function withPublicDataFallback<T>(
  label: string,
  query: () => Promise<T>,
  fallback: T,
  options?: FallbackOptions<T>,
): Promise<PublicDataResult<T>> {
  try {
    return { value: await query(), unavailable: false };
  } catch (error) {
    logger.error(`Public data query failed: ${label}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (options?.fromSnapshot) {
      try {
        const snapshot = await loadPublicSnapshot();
        if (snapshot) {
          const fromSnap = options.fromSnapshot(snapshot);
          if (fromSnap !== null && fromSnap !== undefined) {
            logger.info(`Serving ${label} from public snapshot`);
            return {
              value: fromSnap,
              unavailable: true,
              fromSnapshot: true,
            };
          }
        }
      } catch (snapshotError) {
        logger.error(`Public snapshot fallback failed: ${label}`, {
          error:
            snapshotError instanceof Error
              ? snapshotError.message
              : 'Unknown error',
        });
      }
    }

    return { value: fallback, unavailable: true };
  }
}
