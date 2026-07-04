import 'server-only';

import type { Page } from 'playwright-core';

import { launchScreenshotBrowser } from '@/lib/project-screenshots/launch-browser';
import { isBrowserUnavailableError } from '@/lib/project-screenshots/browser-errors';
import { logger } from '@/lib/logger';

const VIEWPORT = { width: 1440, height: 900 };

export async function withBrowserPage<T>(
  handler: (page: Page) => Promise<T>,
): Promise<T> {
  let browser;

  try {
    browser = await launchScreenshotBrowser();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (isBrowserUnavailableError(message)) {
      throw new Error(`Browser launch failed: ${message}`);
    }
    throw error;
  }

  try {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 1,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      locale: 'en-US',
    });

    const page = await context.newPage();
    return await handler(page);
  } finally {
    await browser.close().catch((error) => {
      logger.warn('Failed to close Playwright browser', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });
  }
}
