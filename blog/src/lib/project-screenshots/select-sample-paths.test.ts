import { describe, expect, it } from 'vitest';

import { selectScreenshotSamplePaths } from '@/lib/project-screenshots/select-sample-paths';

describe('selectScreenshotSamplePaths', () => {
  const navPaths = [
    '/',
    '/login',
    '/dashboard',
    '/dashboard/orders',
    '/admin/users',
    '/features',
    '/pricing',
    '/random-page',
  ];

  it('prioritizes protected routes after authentication', () => {
    expect(
      selectScreenshotSamplePaths(navPaths, { authenticated: true }),
    ).toEqual(['/dashboard', '/dashboard/orders', '/admin/users', '/features']);
  });

  it('samples only public marketing pages when unauthenticated', () => {
    expect(
      selectScreenshotSamplePaths(navPaths, { authenticated: false }),
    ).toEqual(['/features', '/pricing']);
  });
});
