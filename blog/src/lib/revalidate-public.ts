import { revalidatePath } from 'next/cache';
import { locales } from '@/config';
import { getPathname } from '@/navigation';

type Href = Parameters<typeof getPathname>[0]['href'];

function revalidateLocalized(href: Href): void {
  for (const locale of locales) {
    const pathname = getPathname({ locale, href });
    const path = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
    revalidatePath(path);
  }
}

function revalidateFeedsAndSitemap(): void {
  revalidatePath('/sitemap.xml');
  revalidatePath('/feed.xml');
}

/** Blog listesi, anasayfa ve feed/sitemap. */
export function revalidateBlogList(): void {
  revalidateLocalized('/');
  revalidateLocalized('/blog');
  revalidateFeedsAndSitemap();
}

/** Tek yazı + liste. */
export function revalidateBlogDetail(blogId: string): void {
  revalidateBlogList();
  revalidateLocalized({ pathname: '/blog/[id]', params: { id: blogId } });
}

/** Proje listesi ve sitemap. */
export function revalidateProjectList(): void {
  revalidateLocalized('/project');
  revalidateFeedsAndSitemap();
}

/** Tek proje + liste. */
export function revalidateProjectDetail(projectId: string): void {
  revalidateProjectList();
  revalidateLocalized({
    pathname: '/project/[id]',
    params: { id: projectId },
  });
}
