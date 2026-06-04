import { describe, expect, it } from 'vitest';
import { formatAddressLine } from './format';
import type { AddressData } from './types';

describe('formatAddressLine', () => {
  it('formats Turkey address with optional details', () => {
    const data: AddressData = {
      version: 1,
      countryCode: 'TR',
      countryName: 'Türkiye',
      provinceName: 'İstanbul',
      districtName: 'Kadıköy',
      neighborhoodName: 'Caferağa',
      street: 'Moda Cad.',
      buildingNo: '42',
      apartment: '5',
    };

    expect(formatAddressLine(data)).toBe(
      'Moda Cad. No 42, Daire 5, Caferağa, Kadıköy, İstanbul, Türkiye'
    );
  });

  it('formats global address', () => {
    const data: AddressData = {
      version: 1,
      countryCode: 'US',
      countryName: 'United States',
      stateName: 'California',
      cityName: 'San Francisco',
      street: 'Market St',
    };

    expect(formatAddressLine(data)).toBe(
      'Market St, San Francisco, California, United States'
    );
  });
});
