import { describe, expect, it } from 'vitest';

import type { SiteOwnerProfile } from '@/lib/site-owner';
import { buildGeocodeQuery, resolveContactMapLocation } from './location';

const baseOwner: SiteOwnerProfile = {
  name: 'Test',
  email: 'personal@example.com',
  contactEmail: null,
  publicEmail: 'hello@example.com',
  phone: null,
  address: 'Example street',
  addressData: {
    version: 1,
    countryCode: 'TR',
    countryName: 'Türkiye',
    provinceName: 'Denizli',
    districtName: 'Merkezefendi',
    latitude: 37.78,
    longitude: 29.08,
    formattedMapAddress: 'Merkezefendi, Denizli',
  },
  addressShort: 'Merkezefendi/Denizli',
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=37.78,29.08',
  website: null,
  image: null,
  bio: null,
};

describe('resolveContactMapLocation', () => {
  it('returns map data when coordinates and address are available', () => {
    expect(resolveContactMapLocation(baseOwner)).toEqual({
      latitude: 37.78,
      longitude: 29.08,
      addressLabel: 'Merkezefendi/Denizli',
      mapsHref: baseOwner.mapsHref,
      approximate: false,
    });
  });

  it('returns null when coordinates are missing', () => {
    expect(
      resolveContactMapLocation({
        ...baseOwner,
        addressData: { ...baseOwner.addressData!, latitude: undefined },
      })
    ).toBeNull();
  });

  it('returns null when address label or maps link is missing', () => {
    expect(
      resolveContactMapLocation({
        ...baseOwner,
        addressShort: null,
      })
    ).toBeNull();
  });
});

describe('buildGeocodeQuery', () => {
  it('prefers formatted map address', () => {
    expect(buildGeocodeQuery(baseOwner)).toBe('Merkezefendi, Denizli');
  });

  it('builds query from district and province names', () => {
    expect(
      buildGeocodeQuery({
        ...baseOwner,
        address: null,
        addressData: {
          version: 1,
          countryCode: 'TR',
          countryName: 'Türkiye',
          provinceName: 'İstanbul',
          districtName: 'Kadıköy',
        },
        addressShort: 'Kadıköy/İstanbul',
      })
    ).toBe('Kadıköy, İstanbul, Türkiye');
  });

  it('parses short address label when structured data is missing', () => {
    expect(
      buildGeocodeQuery({
        ...baseOwner,
        address: null,
        addressData: null,
        addressShort: 'Kadıköy/İstanbul',
      })
    ).toBe('Kadıköy, İstanbul, Türkiye');
  });
});
