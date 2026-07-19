import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

import { withPublicDataFallback } from '@/lib/data/with-public-data-fallback';
import { logger } from '@/lib/logger';

describe('withPublicDataFallback', () => {
  it('returns query value when successful', async () => {
    const result = await withPublicDataFallback('ok', async () => [1, 2], []);
    expect(result).toEqual({ value: [1, 2], unavailable: false });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('marks unavailable and returns fallback on failure', async () => {
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
});
