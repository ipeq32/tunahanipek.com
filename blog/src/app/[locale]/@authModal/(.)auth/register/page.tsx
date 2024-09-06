'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import RegisterForm from '@/app/[locale]/(authentication)/auth/register/form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function RegisterModal() {
  const router = useRouter();

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
              Register
            </motion.div>
          </DialogTitle>
          <DialogDescription>
            Enter your details below to login to your account
          </DialogDescription>
        </DialogHeader>
        <RegisterForm />
        <Button
          variant="ghost"
          onClick={() => router.push('/auth/login')}
          className="w-full mt-3"
        >
          Login Instead ?
        </Button>
      </DialogContent>
    </Dialog>
  );
}
