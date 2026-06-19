import { describe, expect, it } from 'vitest';
import { detectAuthRequirement } from '@/lib/project-screenshots/detect-auth';

type MockPage = {
  url: () => string;
  title: () => Promise<string>;
  locator: (selector: string) => {
    count: () => Promise<number>;
    filter: (options: { hasText: RegExp }) => { count: () => Promise<number> };
  };
};

function createMockPage(overrides: {
  url?: string;
  title?: string;
  passwordFields?: number;
  authButtons?: number;
}): MockPage {
  return {
    url: () => overrides.url ?? 'https://example.com/dashboard',
    title: async () => overrides.title ?? 'Dashboard',
    locator: (selector: string) => ({
      count: async () => {
        if (selector.includes('password')) {
          return overrides.passwordFields ?? 0;
        }
        return overrides.authButtons ?? 0;
      },
      filter: () => ({
        count: async () => overrides.authButtons ?? 0,
      }),
    }),
  };
}

describe('detectAuthRequirement', () => {
  it('flags redirected auth pages', async () => {
    const page = createMockPage({
      url: 'https://example.com/login',
      title: 'Sign in',
      passwordFields: 1,
    });

    const result = await detectAuthRequirement(
      page as unknown as Parameters<typeof detectAuthRequirement>[0],
      'https://example.com/app',
    );

    expect(result.requiresAuth).toBe(true);
    expect(result.hints).toContain('redirected_to_auth');
  });

  it('does not flag public marketing pages', async () => {
    const page = createMockPage({
      url: 'https://example.com',
      title: 'Acme — Build faster',
      passwordFields: 0,
    });

    const result = await detectAuthRequirement(
      page as unknown as Parameters<typeof detectAuthRequirement>[0],
      'https://example.com',
    );

    expect(result.requiresAuth).toBe(false);
  });
});
