'use client';

import { Link, usePathname } from '@/navigation';
import { ComponentProps, ReactNode } from 'react';

type MenuLinkProps = {
  link: ComponentProps<typeof Link>['href'];
  children: ReactNode;
};

function MenuLinkFeature({ link, children }: MenuLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href={link}
      className={`${pathname === link ? 'text-teal-900 dark:text-teal-200 font-semibold border-teal-900 dark:border-teal-200' : 'text-gray-400 border-transparent'} hover:text-teal-900 dark:hover:text-teal-200 w-full h-12 px-6 py-3 border-b hover:border-teal-900 hover:dark:border-teal-200 transition-colors duration-300 ease-linear`}
    >
      {children}
    </Link>
  );
}

export default MenuLinkFeature;
