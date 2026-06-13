export function resolveOAuthCallbackUrl(pathname: string): string {
  if (pathname.startsWith('http://') || pathname.startsWith('https://')) {
    return pathname;
  }

  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (typeof window === 'undefined') {
    return normalized;
  }

  return `${window.location.origin}${normalized}`;
}

function extractOAuthError(url: string): string | null {
  try {
    const parsed = new URL(url, typeof window === 'undefined' ? undefined : window.location.origin);
    return parsed.searchParams.get('error');
  } catch {
    return null;
  }
}

export function isOAuthErrorRedirectUrl(url: string): boolean {
  return extractOAuthError(url) !== null;
}

export function getOAuthErrorFromRedirectUrl(url: string): string {
  return extractOAuthError(url) ?? 'Configuration';
}
