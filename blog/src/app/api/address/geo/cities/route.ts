import { NextResponse } from 'next/server';
import { ADDRESS_CACHE_HEADERS } from '@/lib/address/fetch-utils';
import { getGeocodedCities } from '@/lib/address/geocoded-api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('countryCode');
  const stateCode = searchParams.get('stateCode');
  const name = searchParams.get('name') ?? undefined;

  if (!countryCode || !stateCode) {
    return NextResponse.json(
      { error: 'countryCode and stateCode are required' },
      { status: 400 }
    );
  }

  try {
    const data = await getGeocodedCities(countryCode, stateCode, name);
    return NextResponse.json(
      { data },
      { headers: ADDRESS_CACHE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to load cities' },
      { status: 502 }
    );
  }
}
