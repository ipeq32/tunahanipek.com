import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales, pathnames, routing } from './config';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import createIntlMiddleware from 'next-intl/middleware';

const protectedPages = [
  pathnames['/blog/add'],
  pathnames['/profile'],
  pathnames['/setting'],
  '/project/*',
];

const adminPages = [pathnames['/admin/blog'], pathnames['/admin/project']];

const authPages = [
  pathnames['/auth/login'],
  pathnames['/auth/register'],
  pathnames['/auth/forgot-password'],
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

  if (isAuth && isAdminPage && !isSuperAdmin(session?.user?.role)) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return intlMiddleware(req);
};

export default async function middleware(req: NextRequest) {
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
  matcher: ['/((?!api|_next|_vercel|sitemap|.*\\..*).*)'],
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
