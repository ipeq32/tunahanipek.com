import 'server-only';

import { UTApi } from 'uploadthing/server';
import { logger } from '@/lib/logger';
import { filterUploadThingUrls } from '@/lib/uploaded-media-urls';

/**
 * Sunucu tarafı UploadThing istemcisi. Token, `UPLOADTHING_TOKEN` ortam
 * değişkeninden otomatik okunur.
 */
const utapi = new UTApi();

/**
 * Bir UploadThing dosya URL'inden dosya anahtarını (file key) çıkarır.
 * Beklenen biçim: `https://<host>/f/<key>`.
 */
function extractFileKey(url: string): string | null {
  try {
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    return segments.at(-1) ?? null;
  } catch {
    return null;
  }
}

/**
 * Verilen URL'lere karşılık gelen dosyaları UploadThing'den siler. Çağrı bir
 * temizleme (cleanup) işlemi olduğundan hatalar yutulmaz ama yukarıya
 * fırlatılmaz; loglanır ve sessizce geçilir (kullanıcı akışını bozmamak için).
 */
export async function deleteUploadedFiles(urls: string[]): Promise<void> {
  const keys = filterUploadThingUrls(urls)
    .map(extractFileKey)
    .filter((key): key is string => Boolean(key));

  if (keys.length === 0) return;

  try {
    await utapi.deleteFiles(keys);
  } catch (error) {
    logger.error('Failed to delete uploaded files', {
      error: error instanceof Error ? error.message : 'Unknown error',
      count: keys.length,
    });
  }
}
