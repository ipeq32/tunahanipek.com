import 'server-only';

import { UTApi } from 'uploadthing/server';

import { logger } from '@/lib/logger';
import { DB_BACKUP_CUSTOM_ID_PREFIX } from '@/lib/db-backup/constants';
import { selectBackupKeysToDelete } from '@/lib/db-backup/retention';

const utapi = new UTApi();
const LIST_PAGE_SIZE = 500;

async function listAllBackupFiles() {
  const backups: {
    key: string;
    customId: string | null;
  }[] = [];

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const page = await utapi.listFiles({ limit: LIST_PAGE_SIZE, offset });
    for (const file of page.files) {
      if (
        file.status === 'Uploaded' &&
        file.customId?.startsWith(DB_BACKUP_CUSTOM_ID_PREFIX)
      ) {
        backups.push({ key: file.key, customId: file.customId });
      }
    }
    hasMore = page.hasMore;
    offset += page.files.length;
    if (page.files.length === 0) break;
  }

  return backups;
}

/**
 * Retention politikasına uymayan eski DB yedeklerini siler.
 */
export async function pruneOldDatabaseBackups(): Promise<{
  scanned: number;
  deleted: number;
}> {
  const backups = await listAllBackupFiles();
  const keysToDelete = selectBackupKeysToDelete(backups);

  if (keysToDelete.length === 0) {
    return { scanned: backups.length, deleted: 0 };
  }

  await utapi.deleteFiles(keysToDelete);

  logger.info('Pruned old database backups', {
    scanned: backups.length,
    deleted: keysToDelete.length,
  });

  return { scanned: backups.length, deleted: keysToDelete.length };
}
