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
      <div className="mesh-background flex min-h-dvh flex-col">
        <NavContact />
        <Navbar />
        <main className="container flex flex-1 flex-col pb-16 pt-2">{children}</main>
        <Footer />
      </div>
    </RecoilRoot>
  );
};

export default MainLayout;
