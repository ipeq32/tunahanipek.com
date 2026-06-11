import { getSession } from '@/lib/cached-session';

import Footer from './Footer';

const FooterShell = async () => {
  const session = await getSession();

  return (
    <Footer
      isAuthenticated={!!session?.user}
      userName={session?.user?.name ?? null}
    />
  );
};

export default FooterShell;
