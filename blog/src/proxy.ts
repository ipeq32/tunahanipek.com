import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales, pathnames, routing } from './config';
import { auth } from '@/auth';
import { canAccessAdminPanel } from '@/lib/auth-roles';
import createIntlMiddleware from 'next-intl/middleware';

const protectedPages = [
  pathnames['/blog/add'],
  pathnames['/profile'],
  pathnames['/setting'],
  '/blog/*/edit',
  '/blog/*/duzenle',
  '/project/*',
];

const adminPages = [
  pathnames['/admin/blog'],
  pathnames['/admin/project'],
  '/admin/project/*',
  '/admin/proje/*',
  pathnames['/admin/comments'],
  pathnames['/admin/users'],
  pathnames['/admin/roles'],
];

const authPages = [
  pathnames['/auth/login'],
  pathnames['/auth/register'],
  pathnames['/auth/forgot-password'],
  pathnames['/auth/reset-password'],
];

const intlMiddleware = createIntlMiddleware(routing);

const testPagesRegex = (
  pages: (string | Record<string, string>)[],
  pathname: string
) => {
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
};

const handleAuth = async (
  req: NextRequest,
  isAuthPage: boolean,
  isProtectedPage: boolean,
  isAdminPage: boolean
) => {
  const session = await auth();
  const isAuth = !!session?.user;

  if (!isAuth && (isProtectedPage || isAdminPage)) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/login?callback=${encodeURIComponent(from)}`, req.url)
    );
  }

  if (
    isAuth &&
    isAdminPage &&
    !canAccessAdminPanel(session?.user?.permissions, session?.user?.email)
  ) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (isAuth && isAuthPage) {
    const oauthError = req.nextUrl.searchParams.get('error');
    if (oauthError) {
      const callback = req.nextUrl.searchParams.get('callbackUrl');
      const target = callback?.startsWith('/')
        ? callback
        : '/setting';
      const redirectUrl = new URL(target, req.nextUrl);
      redirectUrl.searchParams.set('oauthError', oauthError);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return intlMiddleware(req);
};

export async function proxy(req: NextRequest) {
  const isAuthPage = testPagesRegex(authPages, req.nextUrl.pathname);
  const isProtectedPage = testPagesRegex(protectedPages, req.nextUrl.pathname);
  const isAdminPage = testPagesRegex(adminPages, req.nextUrl.pathname);

  const response = await handleAuth(
    req,
    isAuthPage,
    isProtectedPage,
    isAdminPage
  );

  setLocaleCookie(req, response);

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|sitemap|icon|apple-icon|opengraph-image|feed\\.xml|.*\\..*).*)',
  ],
};

function setLocaleCookie(req: NextRequest, response: NextResponse) {
  const urlLocale = locales.find((l) =>
    req.nextUrl.pathname.startsWith(`/${l}`)
  );

  const existingLocaleCookie =
    req.cookies.get('NEXT_LOCALE')?.value === urlLocale;

  if (!existingLocaleCookie) {
    const locale = urlLocale || defaultLocale;
    response.cookies.set('NEXT_LOCALE', locale);
  }
}
