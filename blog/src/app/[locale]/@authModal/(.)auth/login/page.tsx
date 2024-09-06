'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import LoginForm from '@/app/[locale]/(authentication)/auth/login/form';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from '@/navigation';

export default function LoginModal() {
  const [isOpened, setIsOpened] = useState<boolean>(true);

  const searchParams = useSearchParams();
  const session = useSession();
  const router = useRouter();

  const pathname = usePathname();

  const handleClick = () => {
    if (pathname === '/auth/login') {
      router.back();
      setTimeout(() => router.push('/auth/register'), 10);
    } else {
      router.push('/auth/register');
    }
  };

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
          <DialogTitle>
            <motion.div
              animate={{ x: 0 }}
              initial={{ x: 200 }}
              transition={{
                ease: 'backInOut',
                duration: 2,
                y: { duration: 1 },
              }}
              className="text-4xl font-bold text-black dark:text-white mt-5"
            >
              Login
            </motion.div>
          </DialogTitle>
          <DialogDescription>
            Enter your details below to login to your account
          </DialogDescription>
        </DialogHeader>
        <LoginForm setOpenModal={setIsOpened} />
        <Button variant="ghost" onClick={handleClick} className="w-full mt-3">
          Create Account
        </Button>
      </DialogContent>
    </Dialog>
  );
}
