'use client';

import { Menu, BookOpen, FolderKanban, Home, LogOut, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

import { Button } from '../ui/button';
import CallMeFeature from './_features/CallMe';
import GetContactFeature from './_features/GetContact';
import LogoFeature from './_features/Logo';
import { useAuthUser } from '@/components/providers/auth-user-provider';
import MenuLinkFeature from './_features/MenuLink';
import handleSignout from '@/actions/handleSignout';
import { Link, usePathname } from '@/navigation';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import MobileProfileMenu from './_features/MobileProfileMenu';
import MobileNavItem from './_features/MobileNavItem';
import MobileUserStrip from './_features/MobileUserStrip';
import ProfileDropdownMenuFeature from './_features/ProfileDropdownMenu';
import { buildProfileMenuConfig } from './_features/profile-menu-config';
import { SiteContainer } from '@/components/layout/site-container';
import { ToggleTheme } from '@/components/toggle-theme';
import ToggleLanguage from '@/components/toggle-language';
import type { Locale } from '@/i18n/request';

const Navbar = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const t = useTranslations('Navbar.Main');
  const tProfile = useTranslations('Navbar.Main.Sidebar.Profile');
  const tA11y = useTranslations('A11y');
  const locale = useLocale() as Locale;

  const from = searchParams.get('callback') || pathname;

  const menuLinks: Array<{
    title: string;
    href: '/' | '/about-me' | '/blog' | '/project';
    icon: typeof Home;
  }> = [
    { title: t('Link.home'), href: '/', icon: Home },
    { title: t('Link.about'), href: '/about-me', icon: UserRound },
    { title: t('Link.blog'), href: '/blog', icon: BookOpen },
    { title: t('Link.project'), href: '/project', icon: FolderKanban },
  ];

  const { user, status } = useAuthUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileConfig =
    status === 'authenticated'
      ? buildProfileMenuConfig(user, tProfile)
      : null;

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
          {status === 'authenticated' ? (
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
          <SheetContent
            closeLabel={tA11y('closeMenu')}
            className="flex w-[min(100vw-2rem,20rem)] flex-col gap-0 border-border/50 bg-background/95 p-0 backdrop-blur-xl"
          >
            <div className="border-b border-border/50 px-5 pb-4 pt-6">
              <SheetHeader className="space-y-1 text-left">
                <SheetTitle className="text-base font-semibold tracking-tight">
                  {t('Sidebar.title')}
                </SheetTitle>
                <SheetDescription className="text-xs leading-relaxed">
                  {t('Sidebar.description')}
                </SheetDescription>
              </SheetHeader>

              {status === 'authenticated' && profileConfig && (
                <MobileUserStrip
                  user={user}
                  roleLabel={profileConfig.roleLabel}
                  initials={profileConfig.initials}
                />
              )}
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
              <nav
                aria-label={t('Sidebar.title')}
                className="flex flex-col gap-0.5"
              >
                {menuLinks.map((link) => (
                  <MobileNavItem
                    key={link.title}
                    href={link.href}
                    icon={link.icon}
                    label={link.title}
                    onClick={closeMobileMenu}
                  />
                ))}
              </nav>

              {status === 'authenticated' && (
                <MobileProfileMenu
                  user={user}
                  onNavigate={closeMobileMenu}
                />
              )}
            </div>

            <div className="shrink-0 space-y-3 border-t border-border/50 px-4 py-4">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/30 p-2">
                <ToggleTheme />
                <ToggleLanguage locale={locale} />
              </div>

              <GetContactFeature onNavigate={closeMobileMenu} />

              {status === 'authenticated' ? (
                <MobileNavItem
                  icon={LogOut}
                  label={tProfile('logout')}
                  variant="danger"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                />
              ) : (
                <Link
                  href={{
                    pathname: '/auth/login',
                    query: { callback: from },
                  }}
                  className="block w-full"
                  onClick={closeMobileMenu}
                >
                  <Button variant="accent" className="h-10 w-full">
                    {t('Sidebar.login')}
                  </Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </SiteContainer>
    </nav>
  );
};

export default Navbar;
