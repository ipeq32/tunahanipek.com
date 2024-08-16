'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import LoadingLogo from '@/components/loading-logo';

type Props = {
  children: React.ReactNode;
};

const AuthenticationLayout = ({ children }: Props) => {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  const [load, setLoad] = useState(true);
  const [loadTime, setLoadTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();

    window.addEventListener('load', () => {
      const endTime = performance.now();
      setLoadTime(endTime - startTime);
    });
  }, []);

  setTimeout(
    () => {
      setLoad(false);
    },
    loadTime > 1000 ? 0 : 1000 - loadTime
  );

  return load ? (
    // <div className="flex items-center justify-center h-screen">
    //   <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 dark:border-gray-100" />
    // </div>
    <LoadingLogo />
  ) : (
    <div className="bg-sky-50 dark:bg-primary/90 min-h-dvh">
      <div className="container">{children}</div>
    </div>
  );
};

export default AuthenticationLayout;
