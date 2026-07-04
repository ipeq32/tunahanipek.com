import 'server-only';

import path from 'node:path';
import type { Browser } from 'playwright-core';
import { logger } from '@/lib/logger';

function isServerlessRuntime(): boolean {
  return (
    process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME)
  );
}

async function launchServerlessBrowser(): Promise<Browser> {
  const [{ chromium: playwright }, chromiumModule] = await Promise.all([
    import('playwright-core'),
    import('@sparticuz/chromium'),
  ]);

  const chromium = chromiumModule.default;
  chromium.setGraphicsMode = false;

  const executablePath = await chromium.executablePath();
  process.env.LD_LIBRARY_PATH = path.dirname(executablePath);

  logger.info('Launching serverless Chromium for screenshots');

  return playwright.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });
}

async function launchLocalBrowser(): Promise<Browser> {
  try {
    const { chromium } = await import('playwright');
    return chromium.launch({ headless: true });
  } catch (error) {
    logger.warn('Playwright package unavailable, falling back to playwright-core', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    const { chromium } = await import('playwright-core');
    return chromium.launch({
      headless: true,
      channel: 'chrome',
    });
  }
}

export async function launchScreenshotBrowser(): Promise<Browser> {
  if (isServerlessRuntime()) {
    return launchServerlessBrowser();
  }

  return launchLocalBrowser();
}
