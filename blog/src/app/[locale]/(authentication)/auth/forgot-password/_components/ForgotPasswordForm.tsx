'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { FIELD_LIMITS, LIVE_FORM_OPTIONS } from '@/lib/form/field-limits';
import { useFormSubmitDisabled } from '@/lib/form/submit-state';
import { CharacterCount } from '@/components/ui/character-count';

export default function ForgotPasswordForm() {
  const t = useTranslations('Auth.ForgotPassword');
  const locale = useLocale();
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .email(t('validation.emailInvalid'))
          .max(FIELD_LIMITS.contact.email.max),
      }),
    [t]
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
    ...LIVE_FORM_OPTIONS,
  });

  const submitDisabled = useFormSubmitDisabled(form.control);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const res = await fetch(`/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale }),
      });
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
                render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  {t('emailPlaceholder')}
                  <FormRequiredIndicator />
                </FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('emailPlaceholder')} {...field} />
                </FormControl>
                <FormFieldFooter>
                  <FormMessage />
                  <CharacterCount
                    value={field.value}
                    max={FIELD_LIMITS.contact.email.max}
                    showMinWarning={fieldState.isDirty || fieldState.isTouched}
                  />
                </FormFieldFooter>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="accent"
            className="w-full"
            disabled={submitDisabled}
          >
            {t('submit')}
          </Button>
        </form>
      </Form>
      {resetUrl && (
        <p className="break-all text-xs text-muted-foreground">
          {t('devLink')}: {resetUrl}
        </p>
      )}
      <Button variant="outline" asChild className="w-full">
        <Link href="/auth/login">{t('backToLogin')}</Link>
      </Button>
    </div>
  );
}
