'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import { resolveAuthCallbackPath } from '@/lib/auth/callback-path';

export function useAuthCallbackPath(): string {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const query = searchParams.toString();
  const currentPath = query ? `${pathname}?${query}` : pathname;

  return resolveAuthCallbackPath(searchParams.get('callback'), currentPath);
}
