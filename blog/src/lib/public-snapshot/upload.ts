import 'server-only';

import { gzipSync } from 'node:zlib';

import { UTApi, UTFile } from 'uploadthing/server';

import {
  PUBLIC_SNAPSHOT_CUSTOM_ID_PREFIX,
  PUBLIC_SNAPSHOT_KEEP,
} from '@/lib/db-backup/constants';
import { buildPublicSnapshotCustomId } from '@/lib/db-backup/retention';
import { logger } from '@/lib/logger';

const utapi = new UTApi();

export type UploadedPublicSnapshot = {
  customId: string;
  key: string;
  url: string | null;
  bytes: number;
};

async function pruneOldPublicSnapshots(keepCustomId: string): Promise<void> {
  const toDelete: string[] = [];
  let offset = 0;
  let hasMore = true;

  const snapshots: { key: string; customId: string; uploadedAt: number }[] = [];

  while (hasMore) {
    const page = await utapi.listFiles({ limit: 500, offset });
    for (const file of page.files) {
      if (
        file.status === 'Uploaded' &&
        file.customId?.startsWith(PUBLIC_SNAPSHOT_CUSTOM_ID_PREFIX)
      ) {
        snapshots.push({
          key: file.key,
          customId: file.customId,
          uploadedAt: file.uploadedAt,
        });
      }
    }
    hasMore = page.hasMore;
    offset += page.files.length;
    if (page.files.length === 0) break;
  }

  snapshots.sort((a, b) => b.uploadedAt - a.uploadedAt);

  const keep = new Set<string>([keepCustomId]);
  for (const file of snapshots.slice(0, PUBLIC_SNAPSHOT_KEEP)) {
    keep.add(file.customId);
  }

  for (const file of snapshots) {
    if (!keep.has(file.customId)) {
      toDelete.push(file.key);
    }
  }

  if (toDelete.length === 0) return;

  await utapi.deleteFiles(toDelete);
  logger.info('Pruned old public snapshots', { deleted: toDelete.length });
}

/**
 * Public snapshot’ı unique customId ile yükler; başarıdan sonra eskileri budar.
 * Önce silme yok — mevcut snapshot kaybolmaz.
 */
export async function uploadPublicSnapshot(
  json: string,
): Promise<UploadedPublicSnapshot> {
  const customId = buildPublicSnapshotCustomId();
  const fileName = `${customId}.json.gz`;
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
    logger.error('Public snapshot upload failed', {
      customId,
      bytes: compressed.byteLength,
      error: message,
      code,
    });
    throw new Error(
      code
        ? `Public snapshot upload failed: ${code} — ${message}`
        : `Public snapshot upload failed: ${message}`,
    );
  }

  try {
    await pruneOldPublicSnapshots(customId);
  } catch (error) {
    logger.warn('Public snapshot prune failed (new snapshot is uploaded)', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return {
    customId,
    key: result.data.key,
    url: result.data.ufsUrl ?? result.data.url ?? null,
    bytes: compressed.byteLength,
  };
}
