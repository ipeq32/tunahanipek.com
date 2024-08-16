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
import { signOut } from '@/auth';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import MenuLinkFeature from './_features/MenuLink';

const menuLinks = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'About',
    href: '/about-me',
  },
  {
    title: 'Blogs',
    href: '/blog',
  },
  {
    title: 'Projects',
    href: '/project',
  },
];

const Navbar = () => {
  const { data, status } = useSession({
    required: false,
  });

  const user = data?.user;

  return (
    <nav className="sticky top-0 z-50 h-28 bg-sky-100 dark:bg-secondary/90 shadow-md shadow-cyan-200 dark:shadow-slate-700 backdrop-blur-sm">
      <section className="container h-full flex items-center justify-between">
        {/* logo */}
        <LogoFeature />
        {/* nav links */}
        <div className="flex justify-center items-center gap-5 max-xl:hidden">
          {menuLinks.map((link) => (
            <MenuLinkFeature key={link.title} link={link.href}>
              {link.title}
            </MenuLinkFeature>
          ))}
        </div>
        {/* contact */}
        {/* XL and above */}
        <div className="flex flow-row items-center gap-5 max-xl:hidden">
          <CallMeFeature />
          <GetContactFeature />
          {status === 'loading' ? (
            <Skeleton className="h-12 w-12 rounded-full" />
          ) : status === 'authenticated' ? (
            <Button
              variant="destructive"
              className="w-max h-12"
              onClick={() => signOut()}
            >
              Logout
            </Button>
          ) : (
            <Link href={'/auth/login'} className="w-max h-12">
              <Button variant="ghost" className="h-full">
                Login
              </Button>
            </Link>
          )}
        </div>
        {/* below XL */}
        <Sheet>
          <SheetTrigger asChild className="xl:hidden">
            <Button variant="ghost" className="p-2 h-max">
              <Menu width={40} height={40} />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col justify-between border-none">
            <div>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Blog page for developers and designers. Welcome!{' '}
                  {user?.name ?? ''}
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-5 py-5">
                {menuLinks.map((link) => (
                  <MenuLinkFeature key={link.title} link={link.href}>
                    {link.title}
                  </MenuLinkFeature>
                ))}
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <div className="flex flex-col justify-center items-center w-full gap-3">
                  <GetContactFeature />
                  {status === 'loading' ? (
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ) : status === 'authenticated' ? (
                    <div className="flex justify-between items-center gap-2 w-full">
                      <Avatar>
                        <AvatarImage
                          src={
                            user?.image ||
                            'https://img.icons8.com/?size=100&id=21441&format=png&color=000000'
                          }
                        />
                        <AvatarFallback>
                          {user?.name?.charAt(0).toUpperCase() ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => signOut()}
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Link href={'/auth/login'} className="w-full">
                      <Button variant="secondary" className="w-full">
                        Login
                      </Button>
                    </Link>
                  )}
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
