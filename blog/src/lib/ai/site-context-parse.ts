export function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractHtmlTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, ' ').trim();
}

export function extractMetaContent(
  html: string,
  attr: 'name' | 'property',
  value: string,
): string | undefined {
  const forward = new RegExp(
    `<meta[^>]+${attr}=["']${value}["'][^>]+content=["']([^"']+)["']`,
    'i',
  );
  const reverse = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${value}["']`,
    'i',
  );

  return (html.match(forward)?.[1] ?? html.match(reverse)?.[1])?.trim();
}

export function extractHeadings(html: string, limit = 12): string[] {
  const headings: string[] = [];
  const pattern = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let match = pattern.exec(html);

  while (match && headings.length < limit) {
    const text = stripHtmlToText(match[1] ?? '');
    if (text.length >= 3) {
      headings.push(text);
    }
    match = pattern.exec(html);
  }

  return [...new Set(headings)];
}

export function extractInternalPaths(html: string, baseUrl: URL): string[] {
  const paths = new Set<string>();
  const pattern = /<a[^>]+href=["']([^"'#]+)["']/gi;
  let match = pattern.exec(html);

  while (match && paths.size < 24) {
    const href = match[1];
    if (
      !href ||
      href.startsWith('javascript:') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      match = pattern.exec(html);
      continue;
    }

    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.origin !== baseUrl.origin) {
        match = pattern.exec(html);
        continue;
      }

      const path =
        resolved.pathname === '/'
          ? '/'
          : resolved.pathname.replace(/\/$/, '') || '/';
      paths.add(path);
    } catch {
      // Skip invalid URLs in markup.
    }

    match = pattern.exec(html);
  }

  return [...paths];
}

export function isPublicHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    if (host === 'localhost' || host.endsWith('.local')) {
      return false;
    }

    if (
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function htmlLooksLikeAuthPage(html: string): boolean {
  const hasPasswordField = /<input[^>]+type=["']password["']/i.test(html);
  const hasAuthPath = AUTH_PATH_PATTERN.test(html);
  const hasLoginCopy = /log\s*in|sign\s*in|giri[sş]\s*yap/i.test(html);

  return hasPasswordField && (hasAuthPath || hasLoginCopy);
}

const AUTH_PATH_PATTERN =
  /\/(login|signin|sign-in|auth|giris|kayit|register)\b/i;

export const PUBLIC_SITE_PATH =
  /\/(about|features|pricing|product|solutions|services|platform|how-it-works|faq|docs|contact|blog)(\/|$)/i;

export const PROTECTED_SITE_PATH =
  /\/(dashboard|admin|panel|app|account|home|workspace|console|portal|manage|settings)(\/|$)/i;

export function isInterestingSitePath(path: string): boolean {
  return (
    path !== '/' &&
    (PUBLIC_SITE_PATH.test(path) || PROTECTED_SITE_PATH.test(path))
  );
}
