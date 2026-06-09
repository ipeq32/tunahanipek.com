import 'server-only';

import { deleteUploadedFiles } from '@/lib/uploadthing-server';
import { filterUploadThingUrls } from '@/lib/uploaded-media-urls';

export {
  collectBlogMediaUrls,
  collectProjectMediaUrls,
  filterUploadThingUrls,
  findRemovedMediaUrls,
  isUploadThingFileUrl,
} from '@/lib/uploaded-media-urls';

export async function deleteUploadedMedia(urls: string[]): Promise<void> {
  const managed = filterUploadThingUrls(urls);
  if (managed.length === 0) return;
  await deleteUploadedFiles(managed);
}
