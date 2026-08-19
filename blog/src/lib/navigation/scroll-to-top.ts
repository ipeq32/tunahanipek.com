export function scrollWindowToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

export function isAuthPath(pathname: string): boolean {
  return /(?:^|\/)auth\//.test(pathname);
}

export function isInternalNavigationLink(anchor: HTMLAnchorElement): boolean {
  if (anchor.target === '_blank' || anchor.hasAttribute('download')) {
    return false;
  }

  const href = anchor.getAttribute('href');
  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('javascript:')
  ) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) {
    return false;
  }

  const current = new URL(window.location.href);
  if (url.pathname === current.pathname && url.search === current.search) {
    return false;
  }

  return true;
}
