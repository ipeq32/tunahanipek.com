'use client';

import { SessionProvider } from 'next-auth/react';
import { RecoilRoot } from 'recoil';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode } from 'react';

type LayoutChildProps = {
  children: ReactNode;
};

function LayoutChild({ children }: LayoutChildProps) {
  return (
    <RecoilRoot>
      <SessionProvider>
        {children}
        <Toaster position="bottom-right" />
      </SessionProvider>
    </RecoilRoot>
  );
}

export default LayoutChild;
