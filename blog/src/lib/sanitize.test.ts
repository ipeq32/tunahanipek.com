import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
  it('removes script tags', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeHtml(dirty)).not.toContain('<script');
    expect(sanitizeHtml(dirty)).toContain('Hello');
  });

  it('normalizes non-breaking spaces', () => {
    expect(sanitizeHtml('<p>a\u00a0b</p>')).toBe('<p>a b</p>');
  });

  it('preserves safe formatting', () => {
    const dirty = '<p><strong>Bold</strong></p>';
    expect(sanitizeHtml(dirty)).toContain('<strong>');
  });

  it('adds https scheme to protocol-less links', () => {
    const result = sanitizeHtml('<a href="example.com">link</a>');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it('keeps absolute and relative links intact', () => {
    expect(sanitizeHtml('<a href="https://x.com">x</a>')).toContain(
      'href="https://x.com"',
    );
    const relative = sanitizeHtml('<a href="/blog">b</a>');
    expect(relative).toContain('href="/blog"');
    expect(relative).not.toContain('target="_blank"');
  });

  it('preserves mailto links without forcing https', () => {
    const result = sanitizeHtml('<a href="mailto:a@b.com">mail</a>');
    expect(result).toContain('href="mailto:a@b.com"');
    expect(result).not.toContain('target="_blank"');
  });
});
