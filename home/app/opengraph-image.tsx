import { createBrandImageResponse } from './_lib/brand-image';

export const runtime = 'edge';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Tunahan İpek';

export default function OpenGraphImage() {
  return createBrandImageResponse({
    width: 1200,
    height: 630,
    title: 'Tunahan İpek',
    subtitle: 'Yazılım Geliştirici',
  });
}
