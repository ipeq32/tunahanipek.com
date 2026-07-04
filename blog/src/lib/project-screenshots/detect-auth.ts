import type { Page } from 'playwright-core';
import type { AuthDetectionResult } from '@/lib/project-screenshots/types';

export const AUTH_PATH_PATTERNS = [
  /\/login\b/i,
  /\/signin\b/i,
  /\/sign-in\b/i,
  /\/auth\b/i,
  /\/oauth\b/i,
  /\/register\b/i,
  /\/giris\b/i,
  /\/kayit\b/i,
];

export function isAuthPathname(pathname: string): boolean {
  return AUTH_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
}

const LOGIN_TITLE_PATTERNS = [
  /log\s*in/i,
  /sign\s*in/i,
  /sign\s*up/i,
  /giri[sş]/i,
  /kay[ıi]t/i,
  /authenticate/i,
];

function pathnameChangedToAuth(originalUrl: string, currentUrl: string): boolean {
  try {
    const original = new URL(originalUrl);
    const current = new URL(currentUrl);
    if (original.hostname !== current.hostname) {
      return false;
    }
    return isAuthPathname(current.pathname);
  } catch {
    return false;
  }
}

export async function detectAuthRequirement(
  page: Page,
  originalUrl: string,
): Promise<AuthDetectionResult> {
  const hints: string[] = [];
  const currentUrl = page.url();

  if (pathnameChangedToAuth(originalUrl, currentUrl)) {
    hints.push('redirected_to_auth');
  }

  const passwordFieldCount = await page.locator('input[type="password"]:visible').count();
  if (passwordFieldCount > 0) {
    hints.push('password_field');
  }

  const title = await page.title();
  if (LOGIN_TITLE_PATTERNS.some((pattern) => pattern.test(title))) {
    hints.push('login_title');
  }

  const hasAuthButton = await page
    .locator(
      'button:visible, a:visible, [role="button"]:visible',
    )
    .filter({ hasText: /log\s*in|sign\s*in|giri[sş]/i })
    .count();

  if (hasAuthButton > 0 && passwordFieldCount > 0) {
    hints.push('login_form');
  }

  const requiresAuth =
    hints.includes('redirected_to_auth') ||
    (hints.includes('password_field') &&
      (hints.includes('login_title') || hints.includes('login_form')));

  return { requiresAuth, hints };
}
