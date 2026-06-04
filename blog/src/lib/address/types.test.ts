import { describe, expect, it } from 'vitest';
import {
  addressDataSchema,
  formValuesToAddressData,
  isTurkeyCountry,
} from './types';

describe('addressDataSchema', () => {
  it('requires province and district for Turkey', () => {
    const result = addressDataSchema.safeParse({
      version: 1,
      countryCode: 'TR',
      countryName: 'Türkiye',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid Turkey address', () => {
    const result = addressDataSchema.safeParse({
      version: 1,
      countryCode: 'TR',
      countryName: 'Türkiye',
      provinceId: 34,
      provinceName: 'İstanbul',
      districtId: 1,
      districtName: 'Adalar',
    });
    expect(result.success).toBe(true);
  });

  it('requires state and city for non-Turkey', () => {
    const result = addressDataSchema.safeParse({
      version: 1,
      countryCode: 'US',
      countryName: 'United States',
    });
    expect(result.success).toBe(false);
  });
});

describe('formValuesToAddressData', () => {
  it('detects Turkey', () => {
    expect(isTurkeyCountry('tr')).toBe(true);
    const data = formValuesToAddressData({
      countryCode: 'TR',
      countryName: 'Türkiye',
      provinceId: 6,
      provinceName: 'Ankara',
      districtId: 100,
      districtName: 'Çankaya',
      stateCode: '',
      stateName: '',
      cityName: '',
      neighborhoodId: null,
      neighborhoodName: '',
      street: '',
      buildingNo: '',
      apartment: '',
      site: '',
      details: '',
    });
    expect(data.provinceId).toBe(6);
    expect(data.stateCode).toBeUndefined();
  });
});
