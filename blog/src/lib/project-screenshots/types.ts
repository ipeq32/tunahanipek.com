export type CapturedScreenshot = {
  id: string;
  label: string;
  buffer: Buffer;
  scrollY: number;
};

export type AuthDetectionResult = {
  requiresAuth: boolean;
  hints: string[];
};

export type ScreenshotSelection = {
  coverIndex: number;
  galleryIndices: number[];
};

export type ProjectScreenshotCaptureResult =
  | {
      status: 'requires_auth';
      hints: string[];
      pageTitle?: string;
    }
  | {
      status: 'success';
      image: string;
      gallery: string[];
      pageTitle: string;
      selection: ScreenshotSelection;
    };
