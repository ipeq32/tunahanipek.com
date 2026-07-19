import 'server-only';

import type { Page } from 'playwright-core';

import { extractInternalPaths } from '@/lib/ai/site-context-parse';
import { logger } from '@/lib/logger';
import {
  SCREENSHOT_JPEG_QUALITY,
  SCREENSHOT_SCROLL_SETTLE_MS,
  SCREENSHOT_VIEWPORT,
} from '@/lib/project-screenshots/capture-settings';
import {
  navigateToPage,
  prepareAuthenticatedPage,
} from '@/lib/project-screenshots/prepare-authenticated-page';
import {
  pathToScreenshotLabel,
  selectScreenshotSamplePaths,
} from '@/lib/project-screenshots/select-sample-paths';
import { withBrowserPage } from '@/lib/project-screenshots/with-browser-page';
import type {
  AuthDetectionResult,
  CapturedScreenshot,
} from '@/lib/project-screenshots/types';
import type { SiteAuthCredentials } from '@/lib/validations/site-auth';

const VIEWPORT = SCREENSHOT_VIEWPORT;
const MAX_TOTAL_CAPTURES = 10;
const HOME_MAX_SHOTS = 2;
const SCROLL_SETTLE_MS = SCREENSHOT_SCROLL_SETTLE_MS;

export type PageCaptureResult = {
  captures: CapturedScreenshot[];
  auth: AuthDetectionResult;
  pageTitle: string;
};

export type CapturePageOptions = {
  credentials?: SiteAuthCredentials;
  proceedDespiteAuth?: boolean;
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
    Math.max(2, Math.ceil(scrollHeight / viewportHeight)),
  );

  const positions = Array.from({ length: sectionCount }, (_, index) => {
    if (sectionCount === 1) return 0;
    return Math.round((maxScroll * index) / (sectionCount - 1));
  });

  return [...new Set(positions)];
}

async function captureViewportShot(
  page: Page,
  id: string,
  label: string,
  scrollY = 0,
): Promise<CapturedScreenshot> {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());
  await page.waitForTimeout(SCROLL_SETTLE_MS);

  const buffer = await page.screenshot({
    type: 'jpeg',
    quality: SCREENSHOT_JPEG_QUALITY,
    animations: 'disabled',
  });

  return {
    id,
    label,
    buffer: Buffer.from(buffer),
    scrollY,
  };
}

async function captureHomeShots(
  page: Page,
  startIndex: number,
): Promise<CapturedScreenshot[]> {
  const scrollHeight = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  const positions = computeScrollPositions(
    scrollHeight,
    VIEWPORT.height,
    HOME_MAX_SHOTS,
  );

  const captures: CapturedScreenshot[] = [];

  for (let index = 0; index < positions.length; index += 1) {
    const scrollY = positions[index] ?? 0;
    captures.push(
      await captureViewportShot(
        page,
        `shot-${startIndex + index}`,
        index === 0 ? 'home-hero' : 'home-section',
        scrollY,
      ),
    );
  }

  return captures;
}

async function captureImportantPages(
  page: Page,
  baseUrl: URL,
  paths: string[],
  startIndex: number,
): Promise<CapturedScreenshot[]> {
  const captures: CapturedScreenshot[] = [];
  let shotIndex = startIndex;

  for (const path of paths) {
    if (shotIndex >= MAX_TOTAL_CAPTURES) {
      break;
    }

    const pageUrl = new URL(path, baseUrl).toString();

    try {
      await navigateToPage(page, pageUrl);
      captures.push(
        await captureViewportShot(
          page,
          `shot-${shotIndex}`,
          pathToScreenshotLabel(path),
        ),
      );
      shotIndex += 1;
    } catch (error) {
      logger.warn('Important page screenshot skipped', {
        path,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return captures;
}

export async function capturePageScreenshots(
  url: string,
  options: CapturePageOptions = {},
): Promise<PageCaptureResult> {
  return withBrowserPage(async (page) => {
    const prepared = await prepareAuthenticatedPage(page, url, {
      credentials: options.credentials,
    });

    if (prepared.auth.requiresAuth && !prepared.authenticated) {
      if (!options.proceedDespiteAuth) {
        return {
          captures: [],
          auth: prepared.auth,
          pageTitle: await page.title(),
        };
      }
    }

    const baseUrl = new URL(url);
    const homeCaptures = await captureHomeShots(page, 0);
    const navPaths = extractInternalPaths(await page.content(), baseUrl);
    const samplePaths = selectScreenshotSamplePaths(navPaths, {
      authenticated: prepared.authenticated,
    });
    const extraCaptures = await captureImportantPages(
      page,
      baseUrl,
      samplePaths,
      homeCaptures.length,
    );

    const captures = [...homeCaptures, ...extraCaptures].slice(
      0,
      MAX_TOTAL_CAPTURES,
    );
    const pageTitle = await page.title();

    logger.info('Project page screenshots captured', {
      url,
      captureCount: captures.length,
      sampledPaths: samplePaths,
      requiresAuth: prepared.auth.requiresAuth,
      authenticated: prepared.authenticated,
    });

    return {
      captures,
      auth: prepared.auth,
      pageTitle,
    };
  });
}
