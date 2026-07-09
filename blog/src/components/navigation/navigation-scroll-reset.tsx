'use client';

import { useEffect } from 'react';
import { usePathname } from '@/navigation';
import {
  isInternalNavigationLink,
  scrollWindowToTop,
} from '@/lib/navigation/scroll-to-top';

/**
 * İç navigasyonda sayfayı anında üste alır; loading ekranı viewport'ta görünür kalır.
 */
export function NavigationScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    scrollWindowToTop();
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (!isInternalNavigationLink(anchor)) {
        return;
      }

      scrollWindowToTop();
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}
