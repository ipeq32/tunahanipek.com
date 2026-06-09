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
});

describe('pickString', () => {
  it('returns trimmed string values', () => {
    expect(pickString({ title: '  Test  ' }, 'title')).toBe('Test');
  });

  it('returns undefined for empty values', () => {
    expect(pickString({ title: '   ' }, 'title')).toBeUndefined();
  });
});
