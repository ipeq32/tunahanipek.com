import { locales, pathnames } from '@/config';

/** Auth gerektiren (admin olmayan) sayfalar. Public `/project` burada olmamalı. */
export const protectedPages = [
  pathnames['/blog/add'],
  pathnames['/profile'],
  pathnames['/setting'],
  '/blog/*/edit',
  '/blog/*/duzenle',
] as const;

export const adminPages = [
  pathnames['/admin/blog'],
  pathnames['/admin/project'],
  '/admin/project/*',
  '/admin/proje/*',
  pathnames['/admin/comments'],
  pathnames['/admin/users'],
  pathnames['/admin/roles'],
  pathnames['/admin/site-copy'],
  pathnames['/admin/stats'],
  '/admin/stats/*',
  '/admin/istatistikler/*',
  pathnames['/admin/webhooks'],
] as const;

export const superAdminPages = [pathnames['/admin/webhooks']] as const;

export const authPages = [
  pathnames['/auth/login'],
  pathnames['/auth/register'],
  pathnames['/auth/forgot-password'],
  pathnames['/auth/reset-password'],
] as const;

type PagePattern = string | Record<string, string>;

export function testPagesRegex(
  pages: readonly PagePattern[],
  pathname: string,
): boolean {
  const regexParts = pages.map((page) => {
    if (typeof page === 'string') {
      return page.replace('/*', '.*');
    }
    return Object.values(page)
      .map((p) => p.replace('/*', '.*'))
      .join('|');
  });

  const regex = `^(/(${locales.join('|')}))?(${regexParts.join('|')})/?$`;

  return new RegExp(regex, 'i').test(pathname);
}
