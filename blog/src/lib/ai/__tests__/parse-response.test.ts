import { describe, expect, it } from 'vitest';
import { extractJsonObject, pickString } from '@/lib/ai/parse-response';

describe('extractJsonObject', () => {
  it('parses raw JSON', () => {
    const result = extractJsonObject('{"title":"Hello"}');
    expect(result.title).toBe('Hello');
  });

  it('parses fenced JSON', () => {
    const result = extractJsonObject('```json\n{"title":"Hi"}\n```');
    expect(result.title).toBe('Hi');
  });

  it('repairs markdown JSON with raw newlines in strings', () => {
    const broken = `{
  "title": "NestJS ile Restoran API",
  "description": "### Giriş
Kısa tanım."
}`;

    const result = extractJsonObject(broken);
    expect(result.title).toBe('NestJS ile Restoran API');
    expect(String(result.description)).toContain('### Giriş');
    expect(String(result.description)).toContain('Kısa tanım.');
  });
});

describe('pickString', () => {
  it('returns trimmed string values', () => {
    expect(pickString({ title: '  Test  ' }, 'title')).toBe('Test');
  });

  it('returns undefined for empty values', () => {
    expect(pickString({ title: '   ' }, 'title')).toBeUndefined();
  });
});
