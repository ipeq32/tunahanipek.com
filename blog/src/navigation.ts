import { routing } from './config';

import { createNavigation } from 'next-intl/navigation';

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing);
