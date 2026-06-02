'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ToggleTheme } from '@/components/toggle-theme';
import ToggleLanguage from '@/components/toggle-language';
import { useRouter } from '@/navigation';
import { RecoilRoot } from 'recoil';
import Link from 'next/link';

type Props = {
  children: React.ReactNode;
};

const AuthenticationLayout = ({ children }: Props) => {
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  return (
    <RecoilRoot>
      <div className="mesh-background flex min-h-dvh flex-col">
        <header className="container flex items-center justify-between py-6">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-lg font-bold tracking-tight text-gradient"
          >
            Tunahan İPEK
          </button>
          <div className="flex items-center gap-3">
            <ToggleTheme />
            <ToggleLanguage />
          </div>
        </header>

        <div className="container flex flex-1 items-center justify-center px-4 pb-12">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-lg backdrop-blur-sm md:p-8">
              {children}
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link href="/" className="hover:text-teal-600 dark:hover:text-teal-400">
                ← Ana sayfaya dön
              </Link>
            </p>
          </div>
        </div>
      </div>
    </RecoilRoot>
  );
};

export default AuthenticationLayout;
