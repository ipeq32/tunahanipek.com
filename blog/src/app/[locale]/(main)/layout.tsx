'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import NavContact from '@/components/sidebar/Contact';
import Navbar from '@/components/sidebar/Navbar';
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

  return (
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
