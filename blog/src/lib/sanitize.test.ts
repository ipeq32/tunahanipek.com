import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
  it('removes script tags', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeHtml(dirty)).not.toContain('<script');
    expect(sanitizeHtml(dirty)).toContain('Hello');
  });

  it('preserves safe formatting', () => {
    const dirty = '<p><strong>Bold</strong></p>';
    expect(sanitizeHtml(dirty)).toContain('<strong>');
  });
});
