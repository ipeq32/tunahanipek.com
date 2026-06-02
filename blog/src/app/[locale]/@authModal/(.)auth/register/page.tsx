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
import { motion } from 'framer-motion';
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
      <DialogContent className="sm:max-w-[425px]">
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
              {t('title')}
            </motion.div>
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <RegisterForm isModal />
        <Button variant="ghost" onClick={handleClick} className="w-full mt-3">
          {t('button')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
