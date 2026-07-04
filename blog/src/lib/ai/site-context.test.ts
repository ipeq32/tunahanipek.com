import { describe, expect, it } from 'vitest';

import {
  extractHeadings,
  extractHtmlTitle,
  extractInternalPaths,
  extractMetaContent,
  htmlLooksLikeAuthPage,
  isPublicHttpUrl,
  stripHtmlToText,
} from '@/lib/ai/site-context-parse';

describe('site-context', () => {
  it('extracts title, meta, and headings', () => {
    const html = `
      <html>
        <head>
          <title>Kshup — QR Menu</title>
          <meta name="description" content="Digital menu platform" />
        </head>
        <body>
          <h1>Welcome</h1>
          <h2>Features</h2>
        </body>
      </html>
    `;

    expect(extractHtmlTitle(html)).toBe('Kshup — QR Menu');
    expect(extractMetaContent(html, 'name', 'description')).toBe(
      'Digital menu platform',
    );
    expect(extractHeadings(html)).toEqual(['Welcome', 'Features']);
  });

  it('collects same-origin navigation paths', () => {
    const html = `
      <a href="/about">About</a>
      <a href="https://example.com/pricing">Pricing</a>
      <a href="https://other.com/x">External</a>
    `;

    expect(
      extractInternalPaths(html, new URL('https://example.com')),
    ).toEqual(['/about', '/pricing']);
  });

  it('rejects private URLs', () => {
    expect(isPublicHttpUrl('http://localhost:3000')).toBe(false);
    expect(isPublicHttpUrl('https://www.kshup.com')).toBe(true);
  });

  it('strips scripts and tags from snippets', () => {
    const text = stripHtmlToText(
      '<script>alert(1)</script><p>Hello <strong>world</strong></p>',
    );
    expect(text).toBe('Hello world');
  });

  it('detects auth pages in static html', () => {
    expect(
      htmlLooksLikeAuthPage(
        '<form><input type="password" /><button>Sign in</button></form>',
      ),
    ).toBe(true);
    expect(htmlLooksLikeAuthPage('<h1>Welcome to our product</h1>')).toBe(false);
  });
});
