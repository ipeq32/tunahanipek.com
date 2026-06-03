import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  let db: 'ok' | 'error' = 'ok';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    db = 'error';
    logger.error('Health check database ping failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  const status = db === 'ok' ? 'ok' : 'degraded';

  return NextResponse.json(
    {
      status,
      db,
      timestamp: new Date().toISOString(),
    },
    { status: db === 'ok' ? 200 : 503 },
  );
}
