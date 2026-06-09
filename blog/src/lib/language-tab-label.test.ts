import { describe, expect, it } from 'vitest';
import { getLanguageTabLabel } from './language-tab-label';

describe('getLanguageTabLabel', () => {
  it('returns stable labels for supported locales', () => {
    expect(getLanguageTabLabel('en')).toBe('ENGLISH');
    expect(getLanguageTabLabel('tr')).toBe('TÜRKÇE');
  });

  it('uses en-US casing for unknown languages', () => {
    expect(getLanguageTabLabel('de', 'Deutsch')).toBe('DEUTSCH');
  });
});
