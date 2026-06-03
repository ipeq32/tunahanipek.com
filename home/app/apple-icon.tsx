import { createBrandImageResponse } from './_lib/brand-image';

export const runtime = 'edge';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return createBrandImageResponse({ width: 180, height: 180 });
}
