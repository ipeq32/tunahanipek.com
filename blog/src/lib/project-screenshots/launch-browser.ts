import 'server-only';

import type { Browser } from 'playwright-core';
import { logger } from '@/lib/logger';
import {
  ensureServerlessChromiumEnv,
  isServerlessRuntime,
  resolveChromiumBinDirectory,
  resolveRemoteChromiumPackUrl,
} from '@/lib/project-screenshots/serverless-chromium';

async function resolveServerlessExecutablePath(
  chromium: typeof import('@sparticuz/chromium').default,
): Promise<string> {
  const localBin = resolveChromiumBinDirectory();

  if (localBin) {
    try {
      return await chromium.executablePath(localBin);
    } catch (error) {
      logger.warn('Bundled Chromium bin failed, trying remote pack', {
        binPath: localBin,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } else {
    logger.warn('Bundled Chromium bin directory missing from deployment trace');
  }

  const remotePackUrl = resolveRemoteChromiumPackUrl();
  return chromium.executablePath(remotePackUrl);
}

async function launchServerlessBrowser(): Promise<Browser> {
  ensureServerlessChromiumEnv();

  const [{ chromium: playwright }, chromiumModule] = await Promise.all([
    import('playwright-core'),
    import('@sparticuz/chromium'),
  ]);

  const chromium = chromiumModule.default;
  chromium.setGraphicsMode = false;

  const executablePath = await resolveServerlessExecutablePath(chromium);

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
