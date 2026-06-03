'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/app/[locale]/(authentication)/auth/login/_components/form';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { isPublicRegistrationEnabledClient } from '@/lib/public-registration-client';

export default function LoginModal() {
  const [isOpened, setIsOpened] = useState(true);

  const searchParams = useSearchParams();
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const t = useTranslations('Authentication.Login.Page.Modal');

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
      onOpenChange={(isOpen) => setIsOpened(isOpen === null ? true : false)}
    >
      <DialogContent className="gap-0 border-border/60 bg-card/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <LoginForm setOpenModal={setIsOpened} />
        {isPublicRegistrationEnabledClient && (
          <Button variant="ghost" onClick={handleClick} className="mt-3 w-full">
            {t('button')}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
