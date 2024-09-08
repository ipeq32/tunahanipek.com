'use client';

import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

type ModalLayoutProps = {
  children: ReactNode;
};

export default function ModalLayout({ children }: ModalLayoutProps) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
