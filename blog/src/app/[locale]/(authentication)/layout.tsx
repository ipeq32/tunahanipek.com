'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import LoadingLogo from '@/components/loading-logo';
import { ToggleTheme } from '@/components/toggle-theme';
import ToggleLanguage from '@/components/toggle-language';
import { useRouter } from '@/navigation';

type Props = {
  children: React.ReactNode;
};

const AuthenticationLayout = ({ children }: Props) => {
  const locale = useLocale();
  const router = useRouter();

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
    <div className="bg-sky-50 dark:bg-primary/90 h-dvh">
      <div className="container">
        <div className="flex max-md:flex-col items-center justify-between gap-5 py-5">
          <figure
            className="flex justify-center items-center w-32 h-32 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div
              id="preloader"
              className="!w-full !h-full !bg-transparent !z-10"
            >
              <svg
                id="logo"
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 203.29 204.17"
                className="!w-full !h-full"
              >
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#00bc9b" />
                    <stop offset="100%" stopColor="#5eaefd" />
                  </linearGradient>
                </defs>
                <path
                  className="st1 ![animation-direction:alternate-reverse] ![animation-iteration-count:infinite]"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  fill="none"
                  d="M190.42,253.13s1.76,24.46,36.1,24.55l34.34.1s71.44-2.21,70.73,69.92-1.08,79.37-1.08,79.37-2.84,30.61-37.56,30.22c.29-20.25,1.4-106.86,1.4-106.86s-18-10.17-36.65-10.95-38.09-12.13-41.09-15.13a22.3,22.3,0,0,0,8.59.39s-20.33-8-31-32c13.57,15.79,22.05,13.31,22.05,13.31s-26.14-15.74-25.8-32.32C190.66,261.77,190.42,253.13,190.42,253.13Z"
                  transform="translate(-190.41 -253.13)"
                />
                <path
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  fill="none"
                  className="st0 ![animation-direction:alternate-reverse] ![animation-iteration-count:infinite] ![animation-duration:4s]"
                  d="M332.24,300.61a95.75,95.75,0,0,1,5.31,34.69h28.18s22.3-1.66,28-27.88v-6.81Z"
                  transform="translate(-190.41 -253.13)"
                />
              </svg>
            </div>
          </figure>
          <div className="flex max-md:justify-between justify-end items-center gap-5 w-full">
            <ToggleTheme />
            <ToggleLanguage />
          </div>
        </div>
      </div>
      <div className="container h-[calc(100vh-250px)] overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AuthenticationLayout;
