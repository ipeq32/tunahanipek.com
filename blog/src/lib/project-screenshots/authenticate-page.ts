import type { Page } from 'playwright-core';

import { detectAuthRequirement } from '@/lib/project-screenshots/detect-auth';
import type { SiteAuthCredentials } from '@/lib/validations/site-auth';

export type AuthenticatePageResult =
  | { success: true }
  | { success: false; reason: 'no_form' | 'still_requires_auth' };

const USERNAME_SELECTORS = [
  'input[type="email"]:visible',
  'input[autocomplete="username"]:visible',
  'input[name*="user" i]:visible',
  'input[name*="email" i]:visible',
  'input[id*="user" i]:visible',
  'input[id*="email" i]:visible',
  'input[type="text"]:visible',
];

async function findUsernameField(page: Page) {
  for (const selector of USERNAME_SELECTORS) {
    const field = page.locator(selector).first();
    if ((await field.count()) > 0) {
      return field;
    }
  }
  return null;
}

export async function attemptPageAuthentication(
  page: Page,
  originalUrl: string,
  credentials: SiteAuthCredentials,
): Promise<AuthenticatePageResult> {
  const passwordField = page.locator('input[type="password"]:visible').first();
  if ((await passwordField.count()) === 0) {
    return { success: false, reason: 'no_form' };
  }

  const usernameField = await findUsernameField(page);
  if (!usernameField) {
    return { success: false, reason: 'no_form' };
  }

  await usernameField.fill(credentials.username);
  await passwordField.fill(credentials.password);

  const submitButton = page
    .locator('button[type="submit"]:visible, input[type="submit"]:visible')
    .first();

  if ((await submitButton.count()) > 0) {
    await Promise.all([
      page.waitForLoadState('domcontentloaded', { timeout: 15_000 }).catch(() => undefined),
      submitButton.click(),
    ]);
  } else {
    await passwordField.press('Enter');
  }

  await page.waitForTimeout(2_000);

  const auth = await detectAuthRequirement(page, originalUrl);
  if (auth.requiresAuth) {
    return { success: false, reason: 'still_requires_auth' };
  }

  return { success: true };
}
