const ALLOWED_RESUME_HOST_SUFFIXES = ['utfs.io', 'ufs.sh'] as const;

/** UploadThing / UFS üzerindeki PDF URL'lerinin önizleme proxy'si için güvenli mi? */
export function isAllowedResumePdfUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;

    return ALLOWED_RESUME_HOST_SUFFIXES.some(
      (suffix) =>
        parsed.hostname === suffix || parsed.hostname.endsWith(`.${suffix}`)
    );
  } catch {
    return false;
  }
}

/** Ayarlar sayfasındaki iframe önizlemesi — same-origin proxy. */
export function buildAdminResumePreviewSrc(draftUrl?: string): string {
  if (draftUrl && isAllowedResumePdfUrl(draftUrl)) {
    return `/api/admin/resume/preview?url=${encodeURIComponent(draftUrl)}`;
  }
  return '/api/admin/resume/preview';
}
