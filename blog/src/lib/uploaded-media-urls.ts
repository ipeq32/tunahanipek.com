const UPLOADTHING_HOST_SUFFIXES = ['utfs.io', 'ufs.sh'] as const;

/** UploadThing / UFS üzerinde barındırılan dosya URL'si mi? */
export function isUploadThingFileUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;

    return UPLOADTHING_HOST_SUFFIXES.some(
      (suffix) =>
        parsed.hostname === suffix || parsed.hostname.endsWith(`.${suffix}`),
    );
  } catch {
    return false;
  }
}

export function filterUploadThingUrls(urls: Iterable<string>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const url of urls) {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed) || !isUploadThingFileUrl(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}

export function collectProjectMediaUrls(project: {
  image?: string | null;
  gallery?: string[] | null;
}): string[] {
  return filterUploadThingUrls([
    ...(project.image ? [project.image] : []),
    ...(project.gallery ?? []),
  ]);
}

export function collectBlogMediaUrls(blog: {
  image?: string | null;
  shortImage?: string | null;
}): string[] {
  return filterUploadThingUrls([
    ...(blog.image ? [blog.image] : []),
    ...(blog.shortImage ? [blog.shortImage] : []),
  ]);
}

export function findRemovedMediaUrls(
  previous: Iterable<string>,
  next: Iterable<string>,
): string[] {
  const nextSet = new Set(filterUploadThingUrls(next));
  return filterUploadThingUrls(previous).filter((url) => !nextSet.has(url));
}
