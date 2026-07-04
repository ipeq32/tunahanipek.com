/** Logical viewport — physical pixels = width/height × DEVICE_SCALE_FACTOR */
export const SCREENSHOT_VIEWPORT = {
  width: 1440,
  height: 900,
} as const;

/** Retina capture for sharper text and UI details */
export const SCREENSHOT_DEVICE_SCALE_FACTOR = 2;

export const SCREENSHOT_JPEG_QUALITY = 92;

export const SCREENSHOT_SCROLL_SETTLE_MS = 600;
