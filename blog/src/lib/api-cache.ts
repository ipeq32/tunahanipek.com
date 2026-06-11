export const PUBLIC_READ_CACHE_CONTROL =
  'public, s-maxage=60, stale-while-revalidate=120';

export const PUBLIC_READ_CACHE_HEADERS = {
  'Cache-Control': PUBLIC_READ_CACHE_CONTROL,
} as const;

export const TAXONOMY_CACHE_CONTROL =
  'public, s-maxage=300, stale-while-revalidate=600';

export const TAXONOMY_CACHE_HEADERS = {
  'Cache-Control': TAXONOMY_CACHE_CONTROL,
} as const;
