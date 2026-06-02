'use client';

import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetClose,
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
import Link from 'next/link';
import LogoFeature from './_features/Logo';
import { Skeleton } from '../ui/skeleton';
import { useSession } from 'next-auth/react';
import MenuLinkFeature from './_features/MenuLink';
import handleSignout from '@/actions/handleSignout';
import { usePathname } from '@/navigation';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ProfileDropdownMenuFeature from './_features/ProfileDropdownMenu';

const Navbar = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const t = useTranslations('Navbar.Main');

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

  const handleLogout = () => {
    handleSignout().then(() => {
      window.location.reload();
      toast.success('Logged out successfully');
    });
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <section className="container flex h-16 items-center justify-between md:h-[4.5rem]">
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
              href={`/auth/login?callback=${encodeURIComponent(from)}`}
              className="w-max"
            >
              <Button variant="accent" size="sm">
                {t('Sidebar.login')}
              </Button>
            </Link>
          )}
        </div>

        <Sheet>
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
                  <MenuLinkFeature key={link.title} link={link.href}>
                    {link.title}
                  </MenuLinkFeature>
                ))}
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
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
                    />
                  ) : (
                    <Link
                      href={`/auth/login?callback=${encodeURIComponent(from)}`}
                      className="w-full"
                    >
                      <Button variant="accent" className="w-full">
                        {t('Sidebar.login')}
                      </Button>
                    </Link>
                  )}
                  <GetContactFeature />
                </div>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </section>
    </nav>
  );
};

export default Navbar;
