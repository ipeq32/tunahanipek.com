/**
 * UploadThing yükleme limitlerinin tek kaynağı. Hem sunucu tarafındaki dosya
 * router'ı (`api/uploadthing/core.ts`) hem de istemci bileşeni
 * (`components/upload/ImageUpload.tsx`) bu değerleri kullanır.
 *
 * UploadThing fiziksel klasör kullanmaz; paneldeki **Route** sütunu, buradaki
 * endpoint anahtarıdır (ör. `blogImageUploader`, `cvUploader`). Her içerik türü
 * için ayrı route tanımlanır.
 *
 * `maxFileSize` UploadThing'in beklediği literal biçimde tutulur; `maxFileSizeBytes`
 * ise istemci tarafında yükleme öncesi doğrulama için kullanılır.
 */
const contentImageLimits = {
  maxFileSize: '8MB',
  maxFileSizeBytes: 8 * 1024 * 1024,
  maxFileSizeLabel: '8MB',
  compression: {
    maxSizeMB: 7,
    maxWidthOrHeight: 2560,
  },
} as const;

export const UPLOAD_CONFIG = {
  blogImageUploader: contentImageLimits,
  projectImageUploader: contentImageLimits,
  profileImageUploader: contentImageLimits,
  avatarUploader: {
    maxFileSize: '2MB',
    maxFileSizeBytes: 2 * 1024 * 1024,
    maxFileSizeLabel: '2MB',
    compression: {
      maxSizeMB: 1.8,
      maxWidthOrHeight: 512,
    },
  },
  cvUploader: {
    maxFileSize: '4MB',
    maxFileSizeBytes: 4 * 1024 * 1024,
    maxFileSizeLabel: '4MB',
  },
} as const;

export type UploadEndpoint = keyof typeof UPLOAD_CONFIG;

export type ImageUploadEndpoint =
  | 'blogImageUploader'
  | 'projectImageUploader'
  | 'profileImageUploader'
  | 'avatarUploader';

