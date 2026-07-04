import 'server-only';

import type { Page } from 'playwright-core';
import { logger } from '@/lib/logger';
import { detectAuthRequirement } from '@/lib/project-screenshots/detect-auth';
import { launchScreenshotBrowser } from '@/lib/project-screenshots/launch-browser';
import type {
  AuthDetectionResult,
  CapturedScreenshot,
} from '@/lib/project-screenshots/types';

const VIEWPORT = { width: 1440, height: 900 };
const MAX_CAPTURES = 6;
const NAVIGATION_TIMEOUT_MS = 30_000;
const SCROLL_SETTLE_MS = 450;

export type PageCaptureResult = {
  captures: CapturedScreenshot[];
  auth: AuthDetectionResult;
  pageTitle: string;
};

function computeScrollPositions(
  scrollHeight: number,
  viewportHeight: number,
  maxCaptures: number,
): number[] {
  if (scrollHeight <= viewportHeight) {
    return [0];
  }

  const maxScroll = scrollHeight - viewportHeight;
  const sectionCount = Math.min(
    maxCaptures,
    Math.max(3, Math.ceil(scrollHeight / viewportHeight)),
  );

  const positions = Array.from({ length: sectionCount }, (_, index) => {
    if (sectionCount === 1) return 0;
    return Math.round((maxScroll * index) / (sectionCount - 1));
  });

  return [...new Set(positions)];
}

async function navigateToPage(page: Page, url: string): Promise<void> {
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

  await page.waitForTimeout(1200);
}

async function captureAtPositions(page: Page): Promise<CapturedScreenshot[]> {
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const positions = computeScrollPositions(scrollHeight, VIEWPORT.height, MAX_CAPTURES);
  const captures: CapturedScreenshot[] = [];

  for (let index = 0; index < positions.length; index += 1) {
    const scrollY = positions[index] ?? 0;
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(SCROLL_SETTLE_MS);

    const buffer = await page.screenshot({
      type: 'jpeg',
      quality: 82,
      animations: 'disabled',
    });

    captures.push({
      id: `shot-${index}`,
      label: index === 0 ? 'hero' : `section-${index}`,
      buffer: Buffer.from(buffer),
      scrollY,
    });
  }

  await page.evaluate(() => window.scrollTo(0, 0));

  return captures;
}

export async function capturePageScreenshots(url: string): Promise<PageCaptureResult> {
  const browser = await launchScreenshotBrowser();

  try {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 1,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      locale: 'en-US',
    });

    const page = await context.newPage();

    await navigateToPage(page, url);

    const auth = await detectAuthRequirement(page, url);
    const captures = await captureAtPositions(page);
    const pageTitle = await page.title();

    logger.info('Project page screenshots captured', {
      url,
      captureCount: captures.length,
      requiresAuth: auth.requiresAuth,
    });

    return { captures, auth, pageTitle };
  } finally {
    await browser.close().catch((error) => {
      logger.warn('Failed to close Playwright browser', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });
  }
}
