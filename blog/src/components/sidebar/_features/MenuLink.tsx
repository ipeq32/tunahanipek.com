'use client';

import { Link, usePathname } from '@/navigation';
import { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type MenuLinkProps = {
  link: ComponentProps<typeof Link>['href'];
  children: ReactNode;
};

function isLinkActive(pathname: string, href: ComponentProps<typeof Link>['href']) {
  if (typeof href !== 'string') return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuLinkFeature({ link, children }: MenuLinkProps) {
  const pathname = usePathname();
  const active = isLinkActive(pathname, link);

  return (
    <Link
      href={link}
      className={cn(
        'inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors',
        active
          ? 'bg-teal-600 text-white shadow-sm dark:bg-teal-500'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {children}
    </Link>
  );
}

export default MenuLinkFeature;
