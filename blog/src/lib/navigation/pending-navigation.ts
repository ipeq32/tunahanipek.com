export const NAVIGATION_START_EVENT = 'app:navigation-start';

export function startPendingNavigation() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
}

export function subscribePendingNavigationStart(onStart: () => void) {
  window.addEventListener(NAVIGATION_START_EVENT, onStart);
  return () => window.removeEventListener(NAVIGATION_START_EVENT, onStart);
}

export function hrefLooksLikeAuth(href: unknown): boolean {
  if (typeof href === 'string') {
    return /\/auth\//.test(href);
  }

  if (href && typeof href === 'object' && 'pathname' in href) {
    const pathname = (href as { pathname?: unknown }).pathname;
    return typeof pathname === 'string' && pathname.includes('/auth');
  }

  return false;
}
