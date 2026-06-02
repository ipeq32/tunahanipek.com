'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import RegisterForm from '@/app/[locale]/(authentication)/auth/register/_components/form';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function RegisterModal() {
  const router = useRouter();
  const pathname = usePathname();

  const t = useTranslations('Authentication.Register.Page.Modal');

  const handleClick = () => {
    if (pathname === '/auth/register') {
      router.back();
      setTimeout(() => router.push('/auth/login'), 10);
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <Dialog
      defaultOpen
      onOpenChange={(isOpen) => isOpen === false && router.back()}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card/95 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <RegisterForm isModal />
        <Button variant="ghost" onClick={handleClick} className="mt-3 w-full">
          {t('button')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
