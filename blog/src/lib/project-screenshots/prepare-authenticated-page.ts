import type { Page } from 'playwright-core';

import { attemptPageAuthentication } from '@/lib/project-screenshots/authenticate-page';
import { detectAuthRequirement } from '@/lib/project-screenshots/detect-auth';
import type { AuthDetectionResult } from '@/lib/project-screenshots/types';
import type { SiteAuthCredentials } from '@/lib/validations/site-auth';

const NAVIGATION_TIMEOUT_MS = 30_000;

export async function navigateToPage(page: Page, url: string): Promise<void> {
  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: NAVIGATION_TIMEOUT_MS,
    });
  } catch {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: NAVIGATION_TIMEOUT_MS,
    });
  }

  await page.waitForTimeout(1_200);
}

type PrepareAuthenticatedPageOptions = {
  credentials?: SiteAuthCredentials;
};

export type PreparedPageResult = {
  auth: AuthDetectionResult;
  authenticated: boolean;
};

export async function prepareAuthenticatedPage(
  page: Page,
  url: string,
  options: PrepareAuthenticatedPageOptions = {},
): Promise<PreparedPageResult> {
  await navigateToPage(page, url);

  let auth = await detectAuthRequirement(page, url);

  if (auth.requiresAuth && options.credentials) {
    const loginResult = await attemptPageAuthentication(
      page,
      url,
      options.credentials,
    );

    if (loginResult.success) {
      auth = await detectAuthRequirement(page, url);
      return { auth, authenticated: !auth.requiresAuth };
    }

    return {
      auth: {
        requiresAuth: true,
        hints: [...auth.hints, 'login_failed'],
      },
      authenticated: false,
    };
  }

  return { auth, authenticated: !auth.requiresAuth };
}
