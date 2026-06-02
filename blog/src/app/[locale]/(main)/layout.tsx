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
      <main className="container flex min-h-[calc(100dvh-var(--site-header-height))] flex-col pb-16 pt-2">
        {children}
      </main>
      <FooterShell />
    </div>
  );
};

export default MainLayout;
