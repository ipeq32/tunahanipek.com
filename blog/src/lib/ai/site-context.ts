import 'server-only';

import { logger } from '@/lib/logger';
import {
  extractHeadings,
  extractHtmlTitle,
  extractInternalPaths,
  extractMetaContent,
  htmlLooksLikeAuthPage,
  isInterestingSitePath,
  isPublicHttpUrl,
  stripHtmlToText,
} from '@/lib/ai/site-context-parse';
import { fetchSiteContextWithBrowser } from '@/lib/ai/site-context-browser';
import { normalizeExternalUrl } from '@/lib/validations/url-field';
import {
  hasSiteAuthCredentials,
  type SiteAuthCredentials,
} from '@/lib/validations/site-auth';

export type SiteContext = {
  url: string;
  pageTitle?: string;
  metaDescription?: string;
  headings: string[];
  navPaths: string[];
  sampledPages: Array<{
    path: string;
    title?: string;
    snippet?: string;
  }>;
};

export type FetchSiteContextOptions = {
  credentials?: SiteAuthCredentials;
};

export type FetchSiteContextResult =
  | { status: 'success'; context: SiteContext }
  | { status: 'requires_auth'; hints: string[] };

const FETCH_TIMEOUT_MS = 8_000;
const MAX_HTML_BYTES = 500_000;
const MAX_EXTRA_PAGES = 4;
const SNIPPET_LENGTH = 420;

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TunahanIPEK-Bot/1.0 (+https://blog.tunahanipek.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return null;
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_HTML_BYTES) {
      return null;
    }

    return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  } catch (error) {
    logger.warn('Site context fetch failed', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function buildPageSnippet(html: string): string {
  return stripHtmlToText(html).slice(0, SNIPPET_LENGTH);
}

async function fetchSiteContextPublic(
  normalized: string,
): Promise<SiteContext | null> {
  const baseUrl = new URL(normalized);
  const homeHtml = await fetchHtml(normalized);
  if (!homeHtml) {
    return null;
  }

  const navPaths = extractInternalPaths(homeHtml, baseUrl);
  const pageTitle = extractHtmlTitle(homeHtml);

  const context: SiteContext = {
    url: normalized,
    pageTitle,
    metaDescription:
      extractMetaContent(homeHtml, 'name', 'description') ??
      extractMetaContent(homeHtml, 'property', 'og:description'),
    headings: extractHeadings(homeHtml),
    navPaths,
    sampledPages: [
      {
        path: '/',
        title: pageTitle,
        snippet: buildPageSnippet(homeHtml),
      },
    ],
  };

  const extraPaths = navPaths
    .filter(isInterestingSitePath)
    .slice(0, MAX_EXTRA_PAGES);

  for (const path of extraPaths) {
    const pageUrl = new URL(path, baseUrl).toString();
    const html = await fetchHtml(pageUrl);
    if (!html) {
      continue;
    }

    context.sampledPages.push({
      path,
      title: extractHtmlTitle(html),
      snippet: buildPageSnippet(html),
    });
  }

  return context;
}

export async function fetchSiteContext(
  inputUrl: string,
  options: FetchSiteContextOptions = {},
): Promise<FetchSiteContextResult | null> {
  const normalized = normalizeExternalUrl(inputUrl);
  if (!normalized || !isPublicHttpUrl(normalized)) {
    return null;
  }

  const { credentials } = options;

  if (hasSiteAuthCredentials(credentials)) {
    const browserContext = await fetchSiteContextWithBrowser(
      normalized,
      credentials,
    );

    if (!browserContext) {
      return {
        status: 'requires_auth',
        hints: ['login_failed'],
      };
    }

    return { status: 'success', context: browserContext };
  }

  const homeHtml = await fetchHtml(normalized);
  if (homeHtml && htmlLooksLikeAuthPage(homeHtml)) {
    return {
      status: 'requires_auth',
      hints: ['password_field', 'login_form'],
    };
  }

  const context = homeHtml
    ? await fetchSiteContextPublic(normalized)
    : null;

  if (!context) {
    return null;
  }

  logger.info('Site context collected for AI expand', {
    url: normalized,
    navPathCount: context.navPaths.length,
    sampledPageCount: context.sampledPages.length,
  });

  return { status: 'success', context };
}
