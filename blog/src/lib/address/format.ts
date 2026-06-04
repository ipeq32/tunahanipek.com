import type { AddressData } from './types';
import { isTurkeyCountry } from './types';

function joinParts(parts: (string | undefined)[]): string {
  return parts.filter((p) => p && p.trim().length > 0).join(', ');
}

function formatDetailSegment(data: AddressData): string | undefined {
  const lineParts: string[] = [];

  if (data.site?.trim()) {
    lineParts.push(data.site.trim());
  }
  if (data.street?.trim()) {
    const street = data.street.trim();
    const building = data.buildingNo?.trim();
    lineParts.push(building ? `${street} No ${building}` : street);
  } else if (data.buildingNo?.trim()) {
    lineParts.push(`No ${data.buildingNo.trim()}`);
  }
  if (data.apartment?.trim()) {
    lineParts.push(`Daire ${data.apartment.trim()}`);
  }
  if (data.details?.trim()) {
    lineParts.push(data.details.trim());
  }

  return lineParts.length > 0 ? lineParts.join(', ') : undefined;
}

export function formatAddressLine(data: AddressData): string {
  const detail = formatDetailSegment(data);

  if (isTurkeyCountry(data.countryCode)) {
    const locality = joinParts([
      data.neighborhoodName,
      data.districtName,
      data.provinceName,
    ]);
    const body = joinParts([detail, locality]);
    return body ? `${body}, ${data.countryName}` : data.countryName;
  }

  const locality = joinParts([data.cityName, data.stateName]);
  const body = joinParts([detail, locality]);
  return body ? `${body}, ${data.countryName}` : data.countryName;
}
