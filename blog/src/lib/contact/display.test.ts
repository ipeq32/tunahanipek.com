import { describe, expect, it } from 'vitest';

import type { AddressData } from '@/lib/address/types';
import {
  buildMapsHref,
  buildTelHref,
  formatAddressShort,
  formatPhoneDigits,
  formatPhoneDisplay,
  formatPhoneInput,
  normalizePhoneForStorage,
  parsePhoneDigits,
  resolvePublicEmail,
} from './display';

const turkeyAddress: AddressData = {
  version: 1,
  countryCode: 'TR',
  countryName: 'Türkiye',
  provinceName: 'Denizli',
  districtName: 'Merkezefendi',
};

describe('resolvePublicEmail', () => {
  it('prefers contact email when set', () => {
    expect(resolvePublicEmail('hello@tunahanipek.com', 'tnhnipek@gmail.com')).toBe(
      'hello@tunahanipek.com'
    );
  });

  it('falls back to account email', () => {
    expect(resolvePublicEmail(null, 'tnhnipek@gmail.com')).toBe('tnhnipek@gmail.com');
  });
});

describe('buildTelHref', () => {
  it('normalizes Turkish numbers', () => {
    expect(buildTelHref('0541 606 44 88')).toBe('tel:+905416064488');
    expect(buildTelHref('1234567890')).toBe('tel:+901234567890');
  });
});

describe('formatPhoneDisplay', () => {
  it('formats 10-digit numbers', () => {
    expect(formatPhoneDisplay('1234567890')).toBe('+90 (123) 456-7890');
    expect(formatPhoneDisplay('05416064488')).toBe('+90 (541) 606-4488');
  });
});

describe('formatPhoneInput', () => {
  it('formats while typing', () => {
    expect(formatPhoneInput('541')).toBe('+90 (541');
    expect(formatPhoneInput('5416064488')).toBe('+90 (541) 606-4488');
  });

  it('allows deleting formatted prefix', () => {
    expect(formatPhoneInput('+90 (')).toBe('');
    expect(formatPhoneInput('+90 (5')).toBe('+90 (5');
    expect(formatPhoneInput('+90 (90')).toBe('');
  });
});

describe('formatPhoneDigits', () => {
  it('formats national digits without re-parsing prefix', () => {
    expect(formatPhoneDigits('5416064488')).toBe('+90 (541) 606-4488');
    expect(formatPhoneDigits('5')).toBe('+90 (5');
    expect(formatPhoneDigits('')).toBe('');
    expect(formatPhoneDigits('90')).toBe('');
  });
});

describe('parsePhoneDigits', () => {
  it('strips +90 prefix from formatted UI string', () => {
    expect(parsePhoneDigits('+90 (')).toBe('');
    expect(parsePhoneDigits('+90 (5')).toBe('5');
    expect(parsePhoneDigits('+90 (90')).toBe('');
  });

  it('supports sequential backspace from a full formatted number', () => {
    let display = '+90 (541) 606-4488';

    for (let i = 0; i < 25; i += 1) {
      display = display.slice(0, -1);
      const digits = parsePhoneDigits(display);
      const next = formatPhoneDigits(digits);

      expect(next).not.toBe('+90 (90');
      expect(parsePhoneDigits(next)).toBe(digits);
      display = next;
    }

    expect(display).toBe('');
  });
});

describe('normalizePhoneForStorage', () => {
  it('stores national digits only', () => {
    expect(normalizePhoneForStorage('+90 (541) 606-4488')).toBe('5416064488');
  });
});

describe('formatAddressShort', () => {
  it('formats TR district/province', () => {
    expect(formatAddressShort(turkeyAddress, null)).toBe('Merkezefendi/Denizli');
  });
});

describe('buildMapsHref', () => {
  it('uses coordinates when available', () => {
    expect(
      buildMapsHref(
        { ...turkeyAddress, latitude: 37.78, longitude: 29.08 },
        null
      )
    ).toBe('https://www.google.com/maps/search/?api=1&query=37.78,29.08');
  });
});
