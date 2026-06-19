import 'server-only';

import { UTApi } from 'uploadthing/server';
import { logger } from '@/lib/logger';
import type { CapturedScreenshot } from '@/lib/project-screenshots/types';

const utapi = new UTApi();

function toUploadFile(capture: CapturedScreenshot, index: number): File {
  return new File(
    [new Uint8Array(capture.buffer)],
    `project-screenshot-${Date.now()}-${index}.jpg`,
    { type: 'image/jpeg' },
  );
}

export async function uploadCapturedScreenshots(
  captures: CapturedScreenshot[],
  indices: number[],
): Promise<string[]> {
  const selected = indices
    .map((index) => captures[index])
    .filter((capture): capture is CapturedScreenshot => Boolean(capture));

  if (selected.length === 0) {
    return [];
  }

  const files = selected.map((capture, index) => toUploadFile(capture, index));
  const response = await utapi.uploadFiles(files);

  const urls = response
    .map((item) => item.data?.ufsUrl ?? item.data?.url)
    .filter((url): url is string => Boolean(url));

  if (urls.length !== selected.length) {
    logger.error('Some screenshot uploads failed', {
      expected: selected.length,
      uploaded: urls.length,
    });
    throw new Error('Screenshot upload failed');
  }

  return urls;
}
