/** Geçerli Unsplash kapak görseli — seed ve UI yedekleri için */
export const BLOG_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&fit=crop&q=80';

export function resolveBlogImageUrl(url?: string | null): string {
  return resolveBlogImageCandidates(url)[0] ?? BLOG_IMAGE_FALLBACK;
}

/** Önce birincil, sonra tam kapak, en son global yedek */
export function resolveBlogImageCandidates(
  primary?: string | null,
  secondary?: string | null,
): string[] {
  const seen = new Set<string>();
  const candidates: string[] = [];

  for (const url of [primary, secondary]) {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    candidates.push(trimmed);
  }

  if (!seen.has(BLOG_IMAGE_FALLBACK)) {
    candidates.push(BLOG_IMAGE_FALLBACK);
  }

  return candidates;
}
