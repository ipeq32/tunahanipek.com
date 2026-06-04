import { describe, expect, it } from 'vitest';
import { normalizeLocationName } from './map-resolve';

describe('normalizeLocationName', () => {
  it('normalizes Turkish characters for matching', () => {
    expect(normalizeLocationName('İstanbul')).toBe('istanbul');
    expect(normalizeLocationName('  Kadıköy  ')).toBe('kadikoy');
  });
});
