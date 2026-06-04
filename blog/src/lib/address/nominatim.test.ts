import { describe, expect, it } from 'vitest';
import { normalizeNominatimPlace } from './nominatim';

describe('normalizeNominatimPlace', () => {
  it('maps raw nominatim payload to GeocodeResult', () => {
    const result = normalizeNominatimPlace({
      place_id: 123,
      lat: '41.0082',
      lon: '28.9784',
      display_name: 'Istanbul, Turkey',
      address: {
        country: 'Türkiye',
        country_code: 'tr',
        state: 'İstanbul',
      },
    });

    expect(result).toEqual({
      placeId: 123,
      lat: 41.0082,
      lon: 28.9784,
      displayName: 'Istanbul, Turkey',
      address: {
        country: 'Türkiye',
        country_code: 'tr',
        state: 'İstanbul',
      },
    });
  });
});
