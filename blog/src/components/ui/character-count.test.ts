import { describe, expect, it } from 'vitest';
import {
  CharacterCount,
  getCharacterCountState,
} from '@/components/ui/character-count';

describe('getCharacterCountState', () => {
  it('keeps empty fields muted until min warning is enabled', () => {
    expect(getCharacterCountState(0, { min: 2, max: 200 })).toBe('normal');
    expect(
      getCharacterCountState(0, { min: 2, max: 200, showMinWarning: true }),
    ).toBe('below-min');
    expect(
      getCharacterCountState(1, { min: 2, max: 200, showMinWarning: true }),
    ).toBe('below-min');
  });

  it('flags over-max regardless of min warning', () => {
    expect(
      getCharacterCountState(201, { min: 2, max: 200, showMinWarning: false }),
    ).toBe('over-max');
  });
});

describe('CharacterCount', () => {
  it('is a function component export', () => {
    expect(typeof CharacterCount).toBe('function');
  });
});
