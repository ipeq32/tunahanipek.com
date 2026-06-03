import { createBrandImageResponse } from './_lib/brand-image';

export const runtime = 'edge';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return createBrandImageResponse({ width: 32, height: 32 });
}
