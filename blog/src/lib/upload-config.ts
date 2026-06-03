/**
 * UploadThing yükleme limitlerinin tek kaynağı. Hem sunucu tarafındaki dosya
 * router'ı (`api/uploadthing/core.ts`) hem de istemci bileşeni
 * (`components/upload/ImageUpload.tsx`) bu değerleri kullanır; böylece limitler
 * tek yerde tanımlanır ve birbirinden sapmaz.
 *
 * `maxFileSize` UploadThing'in beklediği literal biçimde tutulur; `maxFileSizeBytes`
 * ise istemci tarafında yükleme öncesi doğrulama için kullanılır.
 */
export const UPLOAD_CONFIG = {
  imageUploader: {
    maxFileSize: '8MB',
    maxFileSizeBytes: 8 * 1024 * 1024,
    maxFileSizeLabel: '8MB',
    /**
     * İstemci tarafı sıkıştırma hedefleri. Sunucu limitinin biraz altında
     * tutulur ki sıkıştırma sonrası küçük sapmalar limiti aşmasın.
     */
    compression: {
      maxSizeMB: 7,
      maxWidthOrHeight: 2560,
    },
  },
  avatarUploader: {
    maxFileSize: '2MB',
    maxFileSizeBytes: 2 * 1024 * 1024,
    maxFileSizeLabel: '2MB',
    compression: {
      maxSizeMB: 1.8,
      maxWidthOrHeight: 512,
    },
  },
} as const;

export type UploadEndpoint = keyof typeof UPLOAD_CONFIG;
