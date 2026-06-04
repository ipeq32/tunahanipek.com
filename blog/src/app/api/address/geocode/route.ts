import { NextResponse } from 'next/server';
import { ADDRESS_CACHE_HEADERS } from '@/lib/address/fetch-utils';
import { checkAddressGeoRateLimit } from '@/lib/address/address-api-rate-limit';
import { searchNominatim } from '@/lib/address/nominatim';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const rateLimited = checkAddressGeoRateLimit(request);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';

  if (q.trim().length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    const data = await searchNominatim(q, 5);
    return NextResponse.json(
      { data },
      { headers: { ...ADDRESS_CACHE_HEADERS, 'Cache-Control': 'public, s-maxage=60' } }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 502 }
    );
  }
}
