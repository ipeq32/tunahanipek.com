'use client';

import { useEffect, useState } from 'react';

import { useLocale } from 'next-intl';
import NavContact from '@/components/sidebar/Contact';
import Navbar from '@/components/sidebar/Navbar';
import LoadingLogo from '@/components/loading-logo';
import Footer from '@/components/sidebar/Footer';
import { RecoilRoot } from 'recoil';

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
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
    <RecoilRoot>
      <div className="bg-sky-50 dark:bg-primary/90">
        <NavContact />
        <Navbar />
        <div className="container min-h-dvh">{children}</div>
        <Footer />
      </div>
    </RecoilRoot>
  );
};

export default MainLayout;
