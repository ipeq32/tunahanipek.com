import { SiteContainer } from '@/components/layout/site-container';
import NavContactShell from '@/components/sidebar/NavContactShell';
import Navbar from '@/components/sidebar/Navbar';
import FooterShell from '@/components/sidebar/FooterShell';

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  return (
    <div className="mesh-background flex flex-col">
      <NavContactShell />
      <Navbar />
      <main className="flex min-h-[calc(100dvh-var(--site-header-height))] flex-1 flex-col pb-16 pt-2">
        <SiteContainer className="flex flex-1 flex-col">{children}</SiteContainer>
      </main>
      <FooterShell />
    </div>
  );
};

export default MainLayout;
