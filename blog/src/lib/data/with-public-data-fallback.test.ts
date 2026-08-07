import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/lib/public-snapshot/load', () => ({
  loadPublicSnapshot: vi.fn(),
}));

import { withPublicDataFallback } from '@/lib/data/with-public-data-fallback';
import { logger } from '@/lib/logger';
import { loadPublicSnapshot } from '@/lib/public-snapshot/load';
import type { PublicSnapshot } from '@/lib/public-snapshot/types';

const emptySnapshot: PublicSnapshot = {
  version: 1,
  createdAt: '2026-08-07T00:00:00.000Z',
  languages: [],
  categories: [],
  tags: [],
  blogs: [],
  projects: [],
  siteOwner: null,
  siteResume: null,
  siteSnippets: [],
};

describe('withPublicDataFallback', () => {
  it('returns query value when successful', async () => {
    const result = await withPublicDataFallback('ok', async () => [1, 2], []);
    expect(result).toEqual({ value: [1, 2], unavailable: false });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('marks unavailable and returns fallback on failure', async () => {
    vi.mocked(loadPublicSnapshot).mockResolvedValue(null);

    const result = await withPublicDataFallback(
      'fail',
      async () => {
        throw new Error('db down');
      },
      [],
    );

    expect(result).toEqual({ value: [], unavailable: true });
    expect(logger.error).toHaveBeenCalled();
  });

  it('uses public snapshot when DB fails and selector returns data', async () => {
    vi.mocked(loadPublicSnapshot).mockResolvedValue(emptySnapshot);

    const result = await withPublicDataFallback(
      'snap',
      async () => {
        throw new Error('db down');
      },
      [],
      {
        fromSnapshot: () => [9, 8],
      },
    );

    expect(result).toEqual({
      value: [9, 8],
      unavailable: true,
      fromSnapshot: true,
    });
  });
});
