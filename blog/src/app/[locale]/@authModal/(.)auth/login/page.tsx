'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import LoginForm from '@/app/[locale]/(authentication)/auth/login/form';
import { useSession } from 'next-auth/react';

export default function LoginModal() {
  const [isOpened, setIsOpened] = useState<boolean>(true);

  const searchParams = useSearchParams();
  const session = useSession();
  const router = useRouter();

  const callback = searchParams.get('callback') || '/';

  useEffect(() => {
    if (!isOpened) {
      if (!session?.data) {
        router.back();
      } else {
        window.location.replace(callback);
      }
    }
  }, [callback, isOpened, router, session]);

  return (
    <Dialog
      key="login-modal"
      open={isOpened}
      // defaultOpen
      onOpenChange={(isOpen) => setIsOpened(isOpen === null ? true : false)}
    >
      <DialogContent className="sm:max-w-[425px] gap-0">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Enter your details below to login to your account
          </DialogDescription>
        </DialogHeader>
        <LoginForm setOpenModal={setIsOpened} />
      </DialogContent>
    </Dialog>
  );
}
