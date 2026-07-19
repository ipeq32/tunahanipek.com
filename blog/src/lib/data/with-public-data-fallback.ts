import { logger } from '@/lib/logger';

/**
 * Public Server Component sorgularında DB kesintisini sayfa çöküşüne çevirme.
 * Hata loglanır; çağıran boş/degraded UI gösterebilir.
 */
export async function withPublicDataFallback<T>(
  label: string,
  query: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    logger.error(`Public data query failed: ${label}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return fallback;
  }
}
