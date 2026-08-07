import 'server-only';

import { logger } from '@/lib/logger';
import { exportDatabaseSnapshot } from '@/lib/db-backup/export-database';
import { pruneOldDatabaseBackups } from '@/lib/db-backup/prune-backups';
import { uploadDatabaseBackup } from '@/lib/db-backup/upload-backup';
import {
  buildPublicSnapshotFromBackupTables,
  serializePublicSnapshot,
} from '@/lib/public-snapshot/build-from-backup';
import { clearPublicSnapshotCache } from '@/lib/public-snapshot/load';
import { uploadPublicSnapshot } from '@/lib/public-snapshot/upload';

export type DatabaseBackupResult = {
  customId: string;
  fileName: string;
  key: string;
  url: string | null;
  bytes: number;
  rowCounts: Record<string, number>;
  publicSnapshot: {
    customId: string;
    key: string;
    bytes: number;
  };
  pruned: {
    scanned: number;
    deleted: number;
  };
};

/**
 * Full DB yedeği + public snapshot → UploadThing; eski full yedekleri budar.
 */
export async function runDatabaseBackup(): Promise<DatabaseBackupResult> {
  logger.info('Starting database backup');

  const { payload, json, rowCounts } = await exportDatabaseSnapshot();
  const uploaded = await uploadDatabaseBackup(json);

  const publicSnapshot = buildPublicSnapshotFromBackupTables(
    payload.tables as Parameters<typeof buildPublicSnapshotFromBackupTables>[0],
  );
  const publicUploaded = await uploadPublicSnapshot(
    serializePublicSnapshot(publicSnapshot),
  );
  clearPublicSnapshotCache();

  const pruned = await pruneOldDatabaseBackups();

  logger.info('Database backup completed', {
    customId: uploaded.customId,
    bytes: uploaded.bytes,
    publicSnapshotBytes: publicUploaded.bytes,
    prunedDeleted: pruned.deleted,
  });

  return {
    ...uploaded,
    rowCounts,
    publicSnapshot: {
      customId: publicUploaded.customId,
      key: publicUploaded.key,
      bytes: publicUploaded.bytes,
    },
    pruned,
  };
}
