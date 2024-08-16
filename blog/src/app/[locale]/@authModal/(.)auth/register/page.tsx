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

export default function RegisterModal() {
  const router = useRouter();

  return (
    <Dialog
      defaultOpen
      onOpenChange={(isOpen) => isOpen === false && router.back()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register</DialogTitle>
          <DialogDescription>
            Enter your details below to login to your account
          </DialogDescription>
        </DialogHeader>
        <RegisterForm />
      </DialogContent>
    </Dialog>
  );
}
