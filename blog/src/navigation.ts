import { routing } from './config';

import { createNavigation } from 'next-intl/navigation';
import {
  hrefLooksLikeAuth,
  startPendingNavigation,
} from '@/lib/navigation/pending-navigation';

const navigation = createNavigation(routing);

export const { Link, getPathname, redirect, usePathname } = navigation;

export function useRouter() {
  const router = navigation.useRouter();

  return {
    ...router,
    push: ((href, options) => {
      if (!hrefLooksLikeAuth(href)) {
        startPendingNavigation();
      }
      return router.push(href, options);
    }) as typeof router.push,
    replace: ((href, options) => {
      if (!hrefLooksLikeAuth(href)) {
        startPendingNavigation();
      }
      return router.replace(href, options);
    }) as typeof router.replace,
  };
}
