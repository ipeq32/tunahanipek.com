import type { Locator, Page } from 'playwright-core';

import { detectAuthRequirement, isAuthPathname } from '@/lib/project-screenshots/detect-auth';
import { logger } from '@/lib/logger';
import type { SiteAuthCredentials } from '@/lib/validations/site-auth';

export type AuthenticatePageResult =
  | { success: true }
  | { success: false; reason: 'no_form' | 'still_requires_auth' };

const SUBMIT_READY_TIMEOUT_MS = 8_000;
const POST_SUBMIT_SETTLE_MS = 3_000;

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

async function fillInputField(field: Locator, value: string): Promise<void> {
  await field.click({ timeout: 5_000 });
  await field.fill(value);
  await field.dispatchEvent('input');
  await field.dispatchEvent('change');
  await field.blur();
}

async function waitForEnabledSubmit(page: Page): Promise<Locator | null> {
  const submit = page
    .locator('button[type="submit"]:visible, input[type="submit"]:visible')
    .first();

  if ((await submit.count()) === 0) {
    return null;
  }

  try {
    await page.waitForFunction(
      () => {
        const element = document.querySelector(
          'button[type="submit"], input[type="submit"]',
        ) as HTMLButtonElement | HTMLInputElement | null;

        return Boolean(element && !element.disabled && element.offsetParent !== null);
      },
      undefined,
      { timeout: SUBMIT_READY_TIMEOUT_MS },
    );
  } catch {
    // React forms may keep the button disabled until validation runs; fall back below.
  }

  return submit;
}

async function triggerFormSubmit(
  page: Page,
  submit: Locator | null,
  passwordField: Locator,
): Promise<void> {
  if (submit && (await submit.isEnabled())) {
    await Promise.all([
      page
        .waitForURL((url) => !isAuthPathname(url.pathname), { timeout: 20_000 })
        .catch(() => undefined),
      submit.click(),
    ]);
    return;
  }

  const clickedByRole = await page
    .getByRole('button', {
      name: /log\s*in|sign\s*in|giri[sş]|oturum|submit|devam/i,
    })
    .first()
    .click({ timeout: 3_000 })
    .then(() => true)
    .catch(() => false);

  if (clickedByRole) {
    return;
  }

  const submittedViaDom = await page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) {
      return false;
    }

    form
      .querySelectorAll<HTMLButtonElement | HTMLInputElement>(
        'button[type="submit"], input[type="submit"]',
      )
      .forEach((element) => {
        element.disabled = false;
      });

    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      form.submit();
    }

    return true;
  });

  if (!submittedViaDom) {
    await passwordField.press('Enter');
  }
}

async function waitForLoginResponse(page: Page): Promise<void> {
  await Promise.race([
    page
      .waitForURL((url) => !isAuthPathname(url.pathname), { timeout: 20_000 })
      .catch(() => undefined),
    page
      .waitForFunction(
        () =>
          document.querySelectorAll('input[type="password"]:visible').length === 0,
        undefined,
        { timeout: 20_000 },
      )
      .catch(() => undefined),
    page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => undefined),
  ]);

  await page.waitForTimeout(POST_SUBMIT_SETTLE_MS);
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

  await fillInputField(usernameField, credentials.username);
  await fillInputField(passwordField, credentials.password);

  const submitButton = await waitForEnabledSubmit(page);
  await triggerFormSubmit(page, submitButton, passwordField);
  await waitForLoginResponse(page);

  const auth = await detectAuthRequirement(page, originalUrl);
  if (auth.requiresAuth) {
    logger.warn('Automated site login still requires auth', {
      url: originalUrl,
      currentUrl: page.url(),
      hints: auth.hints,
    });
    return { success: false, reason: 'still_requires_auth' };
  }

  return { success: true };
}
