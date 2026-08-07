import { NextResponse } from 'next/server';

import { runDatabaseBackup } from '@/lib/db-backup/run-backup';
import { verifyCronSecret } from '@/lib/db-backup/verify-cron-secret';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function handleBackup(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runDatabaseBackup();

    return NextResponse.json({
      ok: true,
      customId: result.customId,
      fileName: result.fileName,
      key: result.key,
      bytes: result.bytes,
      publicSnapshot: result.publicSnapshot,
      pruned: result.pruned,
      rowCounts: result.rowCounts,
    });
  } catch (error) {
    logger.error('Cron database backup failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Backup failed',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return handleBackup(request);
}

export async function POST(request: Request) {
  return handleBackup(request);
}
