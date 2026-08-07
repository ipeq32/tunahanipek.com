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
 * Gzip’li dump’ı UploadThing’e yükler.
 * Önce silmez — UploadThing silinen customId’yi hemen yeniden kullanmaya izin vermez;
 * her yükleme unique customId alır.
 */
export async function uploadDatabaseBackup(
  json: string,
  date = new Date(),
): Promise<UploadedBackup> {
  const customId = buildBackupCustomId(date);
  const fileName = buildBackupFileName(customId);
  const compressed = gzipSync(Buffer.from(json, 'utf8'));

  const file = new UTFile([compressed], fileName, {
    customId,
    type: 'application/octet-stream',
  });

  const [result] = await utapi.uploadFiles([file], {
    contentDisposition: 'attachment',
  });

  if (!result || result.error || !result.data) {
    const message = result?.error?.message ?? 'Unknown upload error';
    const code = result?.error?.code;
    logger.error('Database backup upload failed', {
      customId,
      bytes: compressed.byteLength,
      error: message,
      code,
    });
    throw new Error(
      code
        ? `Database backup upload failed: ${code} — ${message}`
        : `Database backup upload failed: ${message}`,
    );
  }

  return {
    customId,
    fileName,
    key: result.data.key,
    url: result.data.ufsUrl ?? result.data.url ?? null,
    bytes: compressed.byteLength,
  };
}
