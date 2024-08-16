import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, localePrefix, locales, pathnames } from './config';
import { auth } from '@/auth';
import createIntlMiddleware from 'next-intl/middleware';

const protectedPages = ['/admin/*', pathnames['/hello/tuna']]; // sadece bunda /* yapmaya izin veriyor yada normal utl /admin/user gibi, nedenini anlamadım.
const authPages = [
  // pathnames["/auth"], // Bu sayfada zaten yönlendirme var.
  pathnames['/auth/login'],
  pathnames['/auth/register'],
  pathnames['/auth/forgot-password'],
];

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  pathnames,
});

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
  isProtectedPage: boolean
) => {
  const session = await auth();
  const isAuth = !!session?.user;

  if (!isAuth && isProtectedPage) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/login?callback=${encodeURIComponent(from)}`, req.url)
    );
  }

  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return intlMiddleware(req);
};

export default async function middleware(req: NextRequest) {
  const isAuthPage = testPagesRegex(authPages, req.nextUrl.pathname);
  const isProtectedPage = testPagesRegex(protectedPages, req.nextUrl.pathname);

  const response = await handleAuth(req, isAuthPage, isProtectedPage);

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
