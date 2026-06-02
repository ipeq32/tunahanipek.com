'use client';

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // React 19 warns when next-themes renders <script> during client re-renders
  // (e.g. locale switch). SSR still injects the executable script for FOUC prevention.
  const scriptProps =
    typeof window === 'undefined'
      ? undefined
      : { type: 'application/json' as const, suppressHydrationWarning: true };

  return (
    <NextThemesProvider scriptProps={scriptProps} {...props}>
      {children}
    </NextThemesProvider>
  );
}
