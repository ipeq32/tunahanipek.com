import { NextResponse } from 'next/server';
import { ADDRESS_CACHE_HEADERS } from '@/lib/address/fetch-utils';
import { getTurkiyeDistricts } from '@/lib/address/turkiye-api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provinceId = Number(searchParams.get('provinceId'));

  if (!Number.isFinite(provinceId) || provinceId <= 0) {
    return NextResponse.json(
      { error: 'provinceId is required' },
      { status: 400 }
    );
  }

  try {
    const data = await getTurkiyeDistricts(provinceId);
    return NextResponse.json(
      { data },
      { headers: ADDRESS_CACHE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to load districts' },
      { status: 502 }
    );
  }
}
