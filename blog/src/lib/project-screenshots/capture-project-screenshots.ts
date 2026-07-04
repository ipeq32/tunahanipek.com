import 'server-only';

import { capturePageScreenshots } from '@/lib/project-screenshots/capture-page';
import { selectBestScreenshots } from '@/lib/project-screenshots/select-with-ai';
import type { ProjectScreenshotCaptureResult } from '@/lib/project-screenshots/types';
import { uploadCapturedScreenshots } from '@/lib/project-screenshots/upload-screenshots';
import { getDecryptedAiConfig } from '@/lib/site-ai-settings';

type CaptureProjectScreenshotsInput = {
  url: string;
  proceedDespiteAuth?: boolean;
  authCredentials?: {
    username: string;
    password: string;
  };
};

export async function captureProjectScreenshots(
  input: CaptureProjectScreenshotsInput,
): Promise<ProjectScreenshotCaptureResult> {
  const { captures, auth, pageTitle } = await capturePageScreenshots(input.url, {
    credentials: input.authCredentials,
    proceedDespiteAuth: input.proceedDespiteAuth,
  });

  if (auth.requiresAuth && captures.length === 0 && !input.proceedDespiteAuth) {
    return {
      status: 'requires_auth',
      hints: auth.hints,
      pageTitle,
    };
  }

  const aiConfig = await getDecryptedAiConfig();
  const selection = await selectBestScreenshots(captures, pageTitle, aiConfig);

  const galleryUrls = await uploadCapturedScreenshots(
    captures,
    selection.galleryIndices,
  );

  const coverInGalleryIndex = selection.galleryIndices.indexOf(selection.coverIndex);

  let coverUrl: string;
  if (coverInGalleryIndex >= 0) {
    coverUrl = galleryUrls[coverInGalleryIndex] ?? galleryUrls[0]!;
  } else {
    const [uploadedCover] = await uploadCapturedScreenshots(captures, [
      selection.coverIndex,
    ]);
    coverUrl = uploadedCover ?? galleryUrls[0]!;
  }

  return {
    status: 'success',
    image: coverUrl,
    gallery: galleryUrls,
    pageTitle,
    selection,
  };
}
