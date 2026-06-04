import { logger } from '@/lib/logger';

export async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
    next: init?.next ?? { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Upstream request failed: ${response.status} ${url}`);
  }

  return response.json() as Promise<T>;
}

export function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export function logAddressUpstreamError(
  source: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  logger.error(`${source} request failed`, {
    error: error instanceof Error ? error.message : 'Unknown error',
    ...context,
  });
}

export const ADDRESS_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
} as const;
