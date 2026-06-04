import { NextResponse } from 'next/server';
import { checkAddressGeoRateLimit } from '@/lib/address/address-api-rate-limit';
import { reverseNominatim } from '@/lib/address/nominatim';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const rateLimited = checkAddressGeoRateLimit(request);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat'));
  const lon = Number(searchParams.get('lon'));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: 'lat and lon are required' },
      { status: 400 }
    );
  }

  try {
    const data = await reverseNominatim(lat, lon);
    if (!data) {
      return NextResponse.json(
        { error: 'No address found for coordinates' },
        { status: 404 }
      );
    }
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: 'Failed to reverse geocode' },
      { status: 502 }
    );
  }
}
