import 'server-only';

import type { Page } from 'playwright-core';

import {
  extractHeadings,
  extractHtmlTitle,
  extractInternalPaths,
  extractMetaContent,
  isInterestingSitePath,
  stripHtmlToText,
} from '@/lib/ai/site-context-parse';
import type { SiteContext } from '@/lib/ai/site-context';
import { prepareAuthenticatedPage, navigateToPage } from '@/lib/project-screenshots/prepare-authenticated-page';
import { withBrowserPage } from '@/lib/project-screenshots/with-browser-page';
import { logger } from '@/lib/logger';
import type { SiteAuthCredentials } from '@/lib/validations/site-auth';

const MAX_EXTRA_PAGES = 6;
const SNIPPET_LENGTH = 420;

function buildPageSnippet(html: string): string {
  return stripHtmlToText(html).slice(0, SNIPPET_LENGTH);
}

function buildContextFromHtml(
  url: string,
  baseUrl: URL,
  html: string,
): Pick<
  SiteContext,
  'pageTitle' | 'metaDescription' | 'headings' | 'navPaths'
> {
  return {
    pageTitle: extractHtmlTitle(html),
    metaDescription:
      extractMetaContent(html, 'name', 'description') ??
      extractMetaContent(html, 'property', 'og:description'),
    headings: extractHeadings(html),
    navPaths: extractInternalPaths(html, baseUrl),
  };
}

async function sampleExtraPages(
  page: Page,
  baseUrl: URL,
  navPaths: string[],
  sampledPages: SiteContext['sampledPages'],
): Promise<void> {
  const extraPaths = navPaths.filter(isInterestingSitePath).slice(0, MAX_EXTRA_PAGES);

  for (const path of extraPaths) {
    const pageUrl = new URL(path, baseUrl).toString();

    try {
      await navigateToPage(page, pageUrl);
      const html = await page.content();
      sampledPages.push({
        path,
        title: extractHtmlTitle(html),
        snippet: buildPageSnippet(html),
      });
    } catch (error) {
      logger.warn('Protected page sampling failed', {
        path,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export async function fetchSiteContextWithBrowser(
  normalizedUrl: string,
  credentials?: SiteAuthCredentials,
): Promise<SiteContext | null> {
  return withBrowserPage(async (page) => {
    const baseUrl = new URL(normalizedUrl);
    const prepared = await prepareAuthenticatedPage(page, normalizedUrl, {
      credentials,
    });

    if (prepared.auth.requiresAuth && !prepared.authenticated) {
      return null;
    }

    const homeHtml = await page.content();
    const homeMeta = buildContextFromHtml(normalizedUrl, baseUrl, homeHtml);
    const sampledPages: SiteContext['sampledPages'] = [
      {
        path: '/',
        title: homeMeta.pageTitle,
        snippet: buildPageSnippet(homeHtml),
      },
    ];

    await sampleExtraPages(page, baseUrl, homeMeta.navPaths, sampledPages);

    logger.info('Browser site context collected for AI expand', {
      url: normalizedUrl,
      authenticated: prepared.authenticated,
      navPathCount: homeMeta.navPaths.length,
      sampledPageCount: sampledPages.length,
    });

    return {
      url: normalizedUrl,
      ...homeMeta,
      sampledPages,
    };
  });
}
