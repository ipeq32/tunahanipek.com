import { createBrandImageResponse } from '@/lib/brand-image';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Tunahan İPEK';

export default function OpenGraphImage() {
  return createBrandImageResponse({
    width: 1200,
    height: 630,
    title: 'Tunahan İPEK',
    subtitle: 'Blog & Portfolio',
  });
}
