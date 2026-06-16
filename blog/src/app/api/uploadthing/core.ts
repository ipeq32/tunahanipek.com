import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { requireAuth, requirePermission } from '@/lib/auth/guards';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { UPLOAD_CONFIG } from '@/lib/upload-config';

const f = createUploadthing();

const AVATAR_UPLOAD_LIMIT = 10;
const AVATAR_UPLOAD_WINDOW_MS = 15 * 60 * 1000;

type AuthImageRoute =
  | 'blogImageUploader'
  | 'projectImageUploader'
  | 'profileImageUploader';

function getImageUploadPermission(
  endpoint: AuthImageRoute
): (typeof PERMISSIONS)[keyof typeof PERMISSIONS] | undefined {
  switch (endpoint) {
    case 'blogImageUploader':
      return PERMISSIONS['upload:blog-image'];
    case 'profileImageUploader':
      return PERMISSIONS['upload:profile-image'];
    case 'projectImageUploader':
      return PERMISSIONS['upload:project-image'];
    default:
      return undefined;
  }
}

/** Blog / proje / profil görselleri — UploadThing panelinde ayrı Route olarak görünür. */
function authImageRoute(endpoint: AuthImageRoute) {
  const config = UPLOAD_CONFIG[endpoint];

  return f({
    image: {
      maxFileSize: config.maxFileSize,
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const permission = getImageUploadPermission(endpoint);

      if (permission) {
        const context = await requirePermission(permission);
        if (!context) {
          throw new UploadThingError('Forbidden');
        }
        return { userId: context.userId };
      }

      const context = await requireAuth();
      if (!context) {
        throw new UploadThingError('Unauthorized');
      }

      return { userId: context.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => ({
      uploadedBy: metadata.userId,
      url: file.ufsUrl,
    }));
}

export const ourFileRouter = {
  blogImageUploader: authImageRoute('blogImageUploader'),
  projectImageUploader: authImageRoute('projectImageUploader'),
  profileImageUploader: authImageRoute('profileImageUploader'),

  /**
   * Kayıt akışında kullanılan herkese açık avatar yükleyici. Kullanıcı henüz
   * oturum açmadığı için kimlik doğrulaması yapılamaz; kötüye kullanımı
   * sınırlamak adına IP bazlı oran sınırı ve küçük dosya boyutu uygulanır.
   */
  avatarUploader: f({
    image: {
      maxFileSize: UPLOAD_CONFIG.avatarUploader.maxFileSize,
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const ip = getClientIp(req);
      const { allowed } = checkRateLimit(
        `avatar-upload:${ip}`,
        AVATAR_UPLOAD_LIMIT,
        AVATAR_UPLOAD_WINDOW_MS
      );

      if (!allowed) {
        throw new UploadThingError('Too many requests. Please try again later.');
      }

      return {};
    })
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),

  /** Site özgeçmişi (PDF) — görsellerden tamamen ayrı route. */
  cvUploader: f({
    pdf: {
      maxFileSize: UPLOAD_CONFIG.cvUploader.maxFileSize,
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const context = await requirePermission(PERMISSIONS['upload:cv']);
      if (!context) {
        throw new UploadThingError('Forbidden');
      }

      return { userId: context.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => ({
      uploadedBy: metadata.userId,
      url: file.ufsUrl,
      name: file.name,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
