import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { UPLOAD_CONFIG } from '@/lib/upload-config';

const f = createUploadthing();

const AVATAR_UPLOAD_LIMIT = 10;
const AVATAR_UPLOAD_WINDOW_MS = 15 * 60 * 1000;

type AuthImageRoute =
  | 'blogImageUploader'
  | 'projectImageUploader'
  | 'profileImageUploader';

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
      const session = await auth();

      if (!session?.user?.id) {
        throw new UploadThingError('Unauthorized');
      }

      return { userId: session.user.id };
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

  /** Site özgeçmişi (PDF) — görsellerden tamamen ayrı route; yalnızca SUPER_ADMIN. */
  cvUploader: f({
    pdf: {
      maxFileSize: UPLOAD_CONFIG.cvUploader.maxFileSize,
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user?.id) {
        throw new UploadThingError('Unauthorized');
      }

      if (!isSuperAdmin(session.user.role)) {
        throw new UploadThingError('Forbidden');
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => ({
      uploadedBy: metadata.userId,
      url: file.ufsUrl,
      name: file.name,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
