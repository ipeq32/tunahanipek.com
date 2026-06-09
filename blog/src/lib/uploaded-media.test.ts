import { describe, expect, it } from 'vitest';
import {
  collectBlogMediaUrls,
  collectProjectMediaUrls,
  filterUploadThingUrls,
  findRemovedMediaUrls,
  isUploadThingFileUrl,
} from './uploaded-media-urls';

const UTFS = 'https://utfs.io/f/abc123';
const UFS = 'https://xyz.ufs.sh/f/def456';
const EXTERNAL = 'https://images.unsplash.com/photo-1';

describe('isUploadThingFileUrl', () => {
  it('accepts utfs.io and ufs.sh hosts', () => {
    expect(isUploadThingFileUrl(UTFS)).toBe(true);
    expect(isUploadThingFileUrl(UFS)).toBe(true);
  });

  it('rejects external image hosts', () => {
    expect(isUploadThingFileUrl(EXTERNAL)).toBe(false);
    expect(isUploadThingFileUrl('not-a-url')).toBe(false);
  });
});

describe('collectProjectMediaUrls', () => {
  it('collects cover and gallery without duplicates', () => {
    expect(
      collectProjectMediaUrls({
        image: UTFS,
        gallery: [UFS, UTFS, EXTERNAL],
      }),
    ).toEqual([UTFS, UFS]);
  });
});

describe('collectBlogMediaUrls', () => {
  it('collects cover and list image', () => {
    expect(
      collectBlogMediaUrls({
        image: UTFS,
        shortImage: UFS,
      }),
    ).toEqual([UTFS, UFS]);
  });
});

describe('findRemovedMediaUrls', () => {
  it('returns urls no longer referenced', () => {
    expect(findRemovedMediaUrls([UTFS, UFS], [UTFS])).toEqual([UFS]);
  });

  it('ignores external urls', () => {
    expect(findRemovedMediaUrls([EXTERNAL, UTFS], [])).toEqual([UTFS]);
  });
});

describe('filterUploadThingUrls', () => {
  it('deduplicates while preserving order', () => {
    expect(filterUploadThingUrls([UTFS, UTFS, UFS])).toEqual([UTFS, UFS]);
  });
});
