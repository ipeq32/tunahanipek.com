import { describe, expect, it } from 'vitest';

import type { AddressData } from '@/lib/address/types';
import {
  buildMapsHref,
  buildTelHref,
  formatAddressShort,
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
