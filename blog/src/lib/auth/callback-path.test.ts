import { describe, expect, it } from 'vitest';

import {
  isValidAuthCallbackPath,
  resolveAuthCallbackPath,
} from '@/lib/auth/callback-path';

describe('callback-path', () => {
  it('rejects unresolved dynamic route segments', () => {
    expect(isValidAuthCallbackPath('/tr/blog/[id]')).toBe(false);
    expect(isValidAuthCallbackPath('/blog/[id]/edit')).toBe(false);
  });

  it('accepts real application paths', () => {
    expect(isValidAuthCallbackPath('/tr/blog/my-post')).toBe(true);
    expect(isValidAuthCallbackPath('/setting')).toBe(true);
  });

  it('falls back when preferred callback is invalid', () => {
    expect(resolveAuthCallbackPath('/blog/[id]', '/tr/blog/real-post')).toBe(
      '/tr/blog/real-post',
    );
  });

  it('returns home when every candidate is invalid', () => {
    expect(resolveAuthCallbackPath('/blog/[id]', '/tr/blog/[id]')).toBe('/');
  });
});
