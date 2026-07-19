import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales, pathnames, routing } from './config';
import { auth } from '@/auth';
import { canAccessAdminPanel } from '@/lib/auth-roles';
import { isPrimarySuperAdmin } from '@/lib/admin/users/primary-super-admin';
import {
  adminPages,
  authPages,
  protectedPages,
  superAdminPages,
  testPagesRegex,
} from '@/lib/route-access';
import createIntlMiddleware from 'next-intl/middleware';

type AppLocale = (typeof locales)[number];

function resolveLocaleFromPathname(pathname: string): AppLocale {
  const segment = pathname.split('/').filter(Boolean)[0];
  if (segment && (locales as readonly string[]).includes(segment)) {
    return segment as AppLocale;
  }
  return defaultLocale;
}

function localizePath(
  internalPath: keyof typeof pathnames,
  locale: AppLocale
): string {
  const route = pathnames[internalPath];
  if (typeof route === 'string') {
    return `/${locale}${route}`;
  }
  return `/${locale}${route[locale]}`;
}

const intlMiddleware = createIntlMiddleware(routing);

const handleAuth = async (
  req: NextRequest,
  isAuthPage: boolean,
  isProtectedPage: boolean,
  isAdminPage: boolean,
  isSuperAdminPage: boolean
) => {
  const session = await auth();
  const isAuth = !!session?.user;

  if (!isAuth && (isProtectedPage || isAdminPage)) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    const locale = resolveLocaleFromPathname(req.nextUrl.pathname);
    const loginUrl = new URL(localizePath('/auth/login', locale), req.url);
    loginUrl.searchParams.set('callback', from);

    return NextResponse.redirect(loginUrl);
  }

  if (
    isAuth &&
    isAdminPage &&
    !canAccessAdminPanel(session?.user?.permissions, session?.user?.email)
  ) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (
    isAuth &&
    isSuperAdminPage &&
    !isPrimarySuperAdmin(session?.user?.email)
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
  const isSuperAdminPage = testPagesRegex(superAdminPages, req.nextUrl.pathname);

  const response = await handleAuth(
    req,
    isAuthPage,
    isProtectedPage,
    isAdminPage,
    isSuperAdminPage
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
