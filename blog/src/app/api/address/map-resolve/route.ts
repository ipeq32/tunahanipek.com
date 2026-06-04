import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAddressGeoRateLimit } from '@/lib/address/address-api-rate-limit';
import { resolveMapLocation } from '@/lib/address/map-resolve';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  lat: z.number(),
  lon: z.number(),
});

export async function POST(request: Request) {
  const rateLimited = checkAddressGeoRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'lat and lon are required' },
        { status: 400 }
      );
    }

    const { lat, lon } = parsed.data;
    const data = await resolveMapLocation(lat, lon);
    return NextResponse.json({ data });
  } catch (error) {
    logger.error('map-resolve failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to resolve map location' },
      { status: 502 }
    );
  }
}
