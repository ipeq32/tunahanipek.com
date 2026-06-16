'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { CharacterCount } from '@/components/ui/character-count';
import {
  Form,
  FormControl,
  FormField,
  FormFieldFooter,
  FormItem,
  FormLabel,
  FormMessage,
  FormRequiredIndicator,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { FIELD_LIMITS, LIVE_FORM_OPTIONS } from '@/lib/form/field-limits';

const passwordMin = FIELD_LIMITS.password.min;

export default function ResetPasswordForm() {
  const t = useTranslations('Auth.ResetPassword');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const schema = useMemo(
    () =>
      z
        .object({
          password: z.string().min(passwordMin, {
            message: t('validation.passwordMin', { min: passwordMin }),
          }),
          passwordConfirm: z.string().min(passwordMin, {
            message: t('validation.passwordMin', { min: passwordMin }),
          }),
        })
        .refine((data) => data.password === data.passwordConfirm, {
          message: t('validation.passwordMismatch'),
          path: ['passwordConfirm'],
        }),
    [t]
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', passwordConfirm: '' },
    ...LIVE_FORM_OPTIONS,
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
      const res = await fetch(`/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...values }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(t('success'));
      router.push('/auth/login');
    } catch {
      toast.error(t('error'));
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-[600px] max-md:w-full space-y-4"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('passwordPlaceholder')}
                <FormRequiredIndicator />
              </FormLabel>
              <FormControl>
                <PasswordInput placeholder={t('passwordPlaceholder')} {...field} />
              </FormControl>
              <FormFieldFooter>
                <FormMessage />
                <CharacterCount value={field.value} min={passwordMin} trim={false} />
              </FormFieldFooter>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('passwordConfirmPlaceholder')}
                <FormRequiredIndicator />
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('passwordConfirmPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormFieldFooter>
                <FormMessage />
                <CharacterCount value={field.value} min={passwordMin} trim={false} />
              </FormFieldFooter>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || !form.formState.isValid}
        >
          {t('submit')}
        </Button>
      </form>
    </Form>
  );
}
