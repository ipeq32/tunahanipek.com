import NavContactShell from '@/components/sidebar/NavContactShell';
import Navbar from '@/components/sidebar/Navbar';
import Footer from '@/components/sidebar/Footer';

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  return (
    <div className="mesh-background flex min-h-dvh flex-col">
      <NavContactShell />
      <Navbar />
      <main className="container flex flex-1 flex-col pb-16 pt-2">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
