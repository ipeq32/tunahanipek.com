/** Geçerli Unsplash kapak görseli — seed ve UI yedekleri için */
export const BLOG_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&fit=crop&q=80';

export function resolveBlogImageUrl(url?: string | null): string {
  const trimmed = url?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : BLOG_IMAGE_FALLBACK;
}
