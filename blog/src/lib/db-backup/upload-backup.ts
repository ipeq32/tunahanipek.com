import 'server-only';

import { gzipSync } from 'node:zlib';

import { UTApi, UTFile } from 'uploadthing/server';

import { logger } from '@/lib/logger';
import {
  buildBackupCustomId,
  buildBackupFileName,
} from '@/lib/db-backup/retention';

const utapi = new UTApi();

export type UploadedBackup = {
  customId: string;
  fileName: string;
  key: string;
  url: string | null;
  bytes: number;
};

/**
 * Aynı günün yedeği varsa siler, gzip’li dump’ı UploadThing’e yükler.
 */
export async function uploadDatabaseBackup(
  json: string,
  date = new Date(),
): Promise<UploadedBackup> {
  const customId = buildBackupCustomId(date);
  const fileName = buildBackupFileName(customId);
  const compressed = gzipSync(Buffer.from(json, 'utf8'));

  try {
    await utapi.deleteFiles(customId, { keyType: 'customId' });
  } catch (error) {
    logger.warn('No existing backup to replace (or delete failed)', {
      customId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  const file = new UTFile([compressed], fileName, {
    customId,
    type: 'application/gzip',
  });

  const [result] = await utapi.uploadFiles([file], {
    contentDisposition: 'attachment',
  });

  if (!result || result.error || !result.data) {
    logger.error('Database backup upload failed', {
      customId,
      error: result?.error?.message ?? 'Unknown upload error',
    });
    throw new Error('Database backup upload failed');
  }

  return {
    customId,
    fileName,
    key: result.data.key,
    url: result.data.ufsUrl ?? result.data.url ?? null,
    bytes: compressed.byteLength,
  };
}
