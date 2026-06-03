'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/navigation';

const schema = z.object({
  email: z.string().email(),
});

export default function ForgotPasswordForm() {
  const t = useTranslations('Auth.ForgotPassword');
  const locale = useLocale();
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const res = await fetch(
        `/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, locale }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(t('success'));
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch {
      toast.error(t('error'));
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="email"
          placeholder={t('emailPlaceholder')}
          {...form.register('email')}
        />
        <Button type="submit" variant="accent" className="w-full">
          {t('submit')}
        </Button>
      </form>
      {resetUrl && (
        <p className="text-xs text-muted-foreground break-all">
          {t('devLink')}: {resetUrl}
        </p>
      )}
      <Button variant="outline" asChild className="w-full">
        <Link href="/auth/login">{t('backToLogin')}</Link>
      </Button>
    </div>
  );
}
