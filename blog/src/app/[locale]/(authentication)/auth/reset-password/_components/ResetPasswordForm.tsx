'use client';

import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/navigation';

const schema = z
  .object({
    password: z.string().min(6),
    passwordConfirm: z.string().min(6),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export default function ResetPasswordForm() {
  const t = useTranslations('Auth.ResetPassword');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', passwordConfirm: '' },
  });

  if (!token) {
    return (
      <p className="text-sm text-red-500">
        {t('invalidToken')}{' '}
        <Link href="/auth/forgot-password" className="underline">
          {t('requestNew')}
        </Link>
      </p>
    );
  }

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, ...values }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(t('success'));
      router.push('/auth/login');
    } catch {
      toast.error(t('error'));
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-[600px] max-md:w-full space-y-4"
    >
      <Input
        type="password"
        placeholder={t('passwordPlaceholder')}
        {...form.register('password')}
      />
      <Input
        type="password"
        placeholder={t('passwordConfirmPlaceholder')}
        {...form.register('passwordConfirm')}
      />
      <Button type="submit" className="w-full">
        {t('submit')}
      </Button>
    </form>
  );
}
