import {
  isInterestingSitePath,
  PROTECTED_SITE_PATH,
  PUBLIC_SITE_PATH,
} from '@/lib/ai/site-context-parse';

const MAX_EXTRA_PAGES = 4;
const MAX_PROTECTED_PAGES = 3;
const MAX_PUBLIC_PAGES = 1;

export function selectScreenshotSamplePaths(
  navPaths: string[],
  options: { authenticated: boolean },
): string[] {
  const interesting = navPaths.filter(isInterestingSitePath);

  if (options.authenticated) {
    const protectedPaths = interesting.filter((path) =>
      PROTECTED_SITE_PATH.test(path),
    );
    const publicPaths = interesting.filter((path) =>
      PUBLIC_SITE_PATH.test(path),
    );

    return [
      ...new Set([
        ...protectedPaths.slice(0, MAX_PROTECTED_PAGES),
        ...publicPaths.slice(0, MAX_PUBLIC_PAGES),
      ]),
    ].slice(0, MAX_EXTRA_PAGES);
  }

  return interesting
    .filter((path) => PUBLIC_SITE_PATH.test(path))
    .slice(0, 2);
}

export function pathToScreenshotLabel(path: string): string {
  if (path === '/') {
    return 'home';
  }

  return path.replace(/^\//, '').replace(/\//g, '-') || 'page';
}
