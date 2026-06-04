import { SiteContainer } from '@/components/layout/site-container';
import NavContactShell from '@/components/sidebar/NavContactShell';
import Navbar from '@/components/sidebar/Navbar';
import FooterShell from '@/components/sidebar/FooterShell';
import { getTranslations } from 'next-intl/server';

type Props = {
  children: React.ReactNode;
};

const MainLayout = async ({ children }: Props) => {
  const t = await getTranslations('A11y');

  return (
    <div className="mesh-background flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-teal-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
      >
        {t('skipToContent')}
      </a>
      <NavContactShell />
      <Navbar />
      <main
        id="main-content"
        className="flex min-h-[calc(100dvh-var(--site-header-height))] flex-1 flex-col pb-16 pt-2"
      >
        <SiteContainer className="flex flex-1 flex-col">{children}</SiteContainer>
      </main>
      <FooterShell />
    </div>
  );
};

export default MainLayout;
