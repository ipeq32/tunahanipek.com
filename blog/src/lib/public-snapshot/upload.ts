import 'server-only';

import { gzipSync } from 'node:zlib';

import { UTApi, UTFile } from 'uploadthing/server';

import {
  PUBLIC_SNAPSHOT_CUSTOM_ID,
} from '@/lib/db-backup/constants';
import { logger } from '@/lib/logger';

const utapi = new UTApi();

export type UploadedPublicSnapshot = {
  customId: string;
  key: string;
  url: string | null;
  bytes: number;
};

/**
 * Public snapshot’ı sabit customId ile UploadThing’e yazar (üzerine yazar).
 */
export async function uploadPublicSnapshot(
  json: string,
): Promise<UploadedPublicSnapshot> {
  const customId = PUBLIC_SNAPSHOT_CUSTOM_ID;
  const fileName = `${customId}.json.gz`;
  const compressed = gzipSync(Buffer.from(json, 'utf8'));

  try {
    await utapi.deleteFiles(customId, { keyType: 'customId' });
  } catch (error) {
    logger.warn('No existing public snapshot to replace (or delete failed)', {
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
    logger.error('Public snapshot upload failed', {
      customId,
      error: result?.error?.message ?? 'Unknown upload error',
    });
    throw new Error('Public snapshot upload failed');
  }

  return {
    customId,
    key: result.data.key,
    url: result.data.ufsUrl ?? result.data.url ?? null,
    bytes: compressed.byteLength,
  };
}
