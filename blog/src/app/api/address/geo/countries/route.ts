import { NextResponse } from 'next/server';
import { ADDRESS_CACHE_HEADERS } from '@/lib/address/fetch-utils';
import { getGeocodedCountries } from '@/lib/address/geocoded-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getGeocodedCountries();
    return NextResponse.json(
      { data },
      { headers: ADDRESS_CACHE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to load countries' },
      { status: 502 }
    );
  }
}
