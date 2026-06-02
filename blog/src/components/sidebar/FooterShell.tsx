import { auth } from '@/auth';

import Footer from './Footer';

const FooterShell = async () => {
  const session = await auth();

  return (
    <Footer
      isAuthenticated={!!session?.user}
      userName={session?.user?.name ?? null}
    />
  );
};

export default FooterShell;
