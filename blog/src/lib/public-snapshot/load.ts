import 'server-only';

import { gunzipSync } from 'node:zlib';

import { UTApi } from 'uploadthing/server';

import {
  PUBLIC_SNAPSHOT_CUSTOM_ID,
  PUBLIC_SNAPSHOT_FORMAT_VERSION,
} from '@/lib/db-backup/constants';
import { logger } from '@/lib/logger';
import type { PublicSnapshot } from '@/lib/public-snapshot/types';

const utapi = new UTApi();

const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  loadedAt: number;
  snapshot: PublicSnapshot;
};

let memoryCache: CacheEntry | null = null;

function isValidSnapshot(value: unknown): value is PublicSnapshot {
  if (!value || typeof value !== 'object') return false;
  const snap = value as PublicSnapshot;
  return (
    snap.version === PUBLIC_SNAPSHOT_FORMAT_VERSION &&
    Array.isArray(snap.blogs) &&
    Array.isArray(snap.projects) &&
    Array.isArray(snap.languages)
  );
}

async function fetchSnapshotFromUploadThing(): Promise<PublicSnapshot | null> {
  try {
    const signed = await utapi.getSignedURL(PUBLIC_SNAPSHOT_CUSTOM_ID, {
      keyType: 'customId',
      expiresIn: 60 * 10,
    });

    const downloadUrl = signed.ufsUrl ?? signed.url;
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      logger.error('Failed to download public snapshot', {
        status: response.status,
      });
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const json = gunzipSync(buffer).toString('utf8');
    const parsed: unknown = JSON.parse(json);

    if (!isValidSnapshot(parsed)) {
      logger.error('Public snapshot payload invalid');
      return null;
    }

    return parsed;
  } catch (error) {
    logger.error('Public snapshot load failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * UploadThing’teki son public snapshot’ı yükler (5 dk process-local cache).
 */
export async function loadPublicSnapshot(): Promise<PublicSnapshot | null> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.loadedAt < CACHE_TTL_MS) {
    return memoryCache.snapshot;
  }

  const snapshot = await fetchSnapshotFromUploadThing();
  if (!snapshot) {
    return null;
  }

  memoryCache = { loadedAt: now, snapshot };
  return snapshot;
}

/** Test / yedek upload sonrası cache temizliği. */
export function clearPublicSnapshotCache(): void {
  memoryCache = null;
}
