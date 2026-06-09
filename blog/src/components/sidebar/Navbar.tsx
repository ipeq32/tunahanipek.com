'use client';

import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

import { Button } from '../ui/button';
import CallMeFeature from './_features/CallMe';
import GetContactFeature from './_features/GetContact';
import LogoFeature from './_features/Logo';
import { Skeleton } from '../ui/skeleton';
import { useSession } from 'next-auth/react';
import MenuLinkFeature from './_features/MenuLink';
import handleSignout from '@/actions/handleSignout';
import { Link, usePathname } from '@/navigation';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import ProfileDropdownMenuFeature from './_features/ProfileDropdownMenu';
import { SiteContainer } from '@/components/layout/site-container';
import { ToggleTheme } from '@/components/toggle-theme';
import ToggleLanguage from '@/components/toggle-language';
import type { Locale } from '@/i18n/request';

const Navbar = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const t = useTranslations('Navbar.Main');
  const locale = useLocale() as Locale;

  const from = searchParams.get('callback') || pathname;

  const menuLinks: Array<{
    title: string;
    href: '/' | '/about-me' | '/blog' | '/project';
  }> = [
    { title: t('Link.home'), href: '/' },
    { title: t('Link.about'), href: '/about-me' },
    { title: t('Link.blog'), href: '/blog' },
    { title: t('Link.project'), href: '/project' },
  ];

  const { data, status } = useSession({ required: false });
  const user = data?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    handleSignout().then(() => {
      window.location.reload();
      toast.success(t('logoutSuccess'));
    });
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <SiteContainer
        as="section"
        className="flex h-16 items-center justify-between md:h-[4.5rem]"
      >
        <LogoFeature />

        <div className="hidden items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1 xl:flex">
          {menuLinks.map((link) => (
            <MenuLinkFeature key={link.title} link={link.href}>
              {link.title}
            </MenuLinkFeature>
          ))}
        </div>

        <div className="hidden items-center gap-3 xl:flex">
          <CallMeFeature />
          <GetContactFeature />
          {status === 'loading' ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : status === 'authenticated' ? (
            <ProfileDropdownMenuFeature user={user} onLogout={handleLogout} />
          ) : (
            <Link
              href={{
                pathname: '/auth/login',
                query: { callback: from },
              }}
              className="w-max"
            >
              <Button variant="accent" size="sm">
                {t('Sidebar.login')}
              </Button>
            </Link>
          )}
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="xl:hidden">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-6 w-6" />
              <span className="sr-only">{t('Sidebar.title')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col border-border/60 bg-background/95 backdrop-blur-xl">
            <div>
              <SheetHeader>
                <SheetTitle>{t('Sidebar.title')}</SheetTitle>
                <SheetDescription>
                  {t('Sidebar.description')} {user?.name ?? ''}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {menuLinks.map((link) => (
                  <MenuLinkFeature
                    key={link.title}
                    link={link.href}
                    onClick={closeMobileMenu}
                    className="w-full justify-start rounded-lg"
                  >
                    {link.title}
                  </MenuLinkFeature>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-3 border-t border-border/60 pt-6">
                <ToggleTheme />
                <ToggleLanguage locale={locale} />
              </div>
            </div>
            <SheetFooter>
              <div
                className={`w-full gap-3 ${status === 'unauthenticated' ? 'flex flex-col-reverse' : 'flex flex-row-reverse'}`}
              >
                {status === 'loading' ? (
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[160px]" />
                    </div>
                  </div>
                ) : status === 'authenticated' ? (
                  <ProfileDropdownMenuFeature
                    user={user}
                    onLogout={handleLogout}
                    onNavigate={closeMobileMenu}
                  />
                ) : (
                  <Link
                    href={{
                      pathname: '/auth/login',
                      query: { callback: from },
                    }}
                    className="w-full"
                    onClick={closeMobileMenu}
                  >
                    <Button variant="accent" className="w-full">
                      {t('Sidebar.login')}
                    </Button>
                  </Link>
                )}
                <GetContactFeature onNavigate={closeMobileMenu} />
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </SiteContainer>
    </nav>
  );
};

export default Navbar;
