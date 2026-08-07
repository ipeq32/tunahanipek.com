import 'server-only';

import { logger } from '@/lib/logger';
import { exportDatabaseSnapshot } from '@/lib/db-backup/export-database';
import { pruneOldDatabaseBackups } from '@/lib/db-backup/prune-backups';
import { uploadDatabaseBackup } from '@/lib/db-backup/upload-backup';

export type DatabaseBackupResult = {
  customId: string;
  fileName: string;
  key: string;
  url: string | null;
  bytes: number;
  rowCounts: Record<string, number>;
  pruned: {
    scanned: number;
    deleted: number;
  };
};

/**
 * DB snapshot al → UploadThing’e yükle → eski yedekleri budar.
 */
export async function runDatabaseBackup(): Promise<DatabaseBackupResult> {
  logger.info('Starting database backup');

  const { json, rowCounts } = await exportDatabaseSnapshot();
  const uploaded = await uploadDatabaseBackup(json);
  const pruned = await pruneOldDatabaseBackups();

  logger.info('Database backup completed', {
    customId: uploaded.customId,
    bytes: uploaded.bytes,
    prunedDeleted: pruned.deleted,
  });

  return {
    ...uploaded,
    rowCounts,
    pruned,
  };
}
