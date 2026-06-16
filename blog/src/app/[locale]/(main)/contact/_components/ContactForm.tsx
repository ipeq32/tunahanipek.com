'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CharacterCount } from '@/components/ui/character-count';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { ContentCard } from '@/components/layout/content-card';
import { FIELD_LIMITS, LIVE_FORM_OPTIONS } from '@/lib/form/field-limits';

type FormValues = {
  name: string;
  email: string;
  message: string;
};

export function ContactForm() {
  const t = useTranslations('Pages.Contact.Form');
  const limits = FIELD_LIMITS.contact;

  const schema = z.object({
    name: z.string().trim().min(limits.name.min, t('nameError')).max(limits.name.max, t('nameError')),
    email: z.string().email(t('emailError')).max(limits.email.max, t('emailError')),
    message: z
      .string()
      .trim()
      .min(limits.message.min, t('messageError'))
      .max(limits.message.max, t('messageError')),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: '' },
    ...LIVE_FORM_OPTIONS,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as { message?: string };

      if (res.status === 429) {
        toast.error(t('rateLimited'));
        return;
      }

      if (res.status === 503) {
        toast.error(t('unavailable'));
        return;
      }

      if (!res.ok) {
        throw new Error(data.message);
      }

      toast.success(t('success'));
      form.reset();
    } catch {
      toast.error(t('error'));
    }
  };

  return (
    <ContentCard className="p-6 md:p-8">
      <h2 className="mb-6 text-xl font-semibold tracking-tight">{t('title')}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('nameLabel')}
                  <FormRequiredIndicator />
                </FormLabel>
                <FormControl>
                  <Input placeholder={t('namePlaceholder')} {...field} />
                </FormControl>
                <FormFieldFooter>
                  <FormMessage />
                  <CharacterCount
                    value={field.value}
                    min={limits.name.min}
                    max={limits.name.max}
                  />
                </FormFieldFooter>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('emailLabel')}
                  <FormRequiredIndicator />
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormFieldFooter>
                  <FormMessage />
                  <CharacterCount value={field.value} max={limits.email.max} />
                </FormFieldFooter>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('messageLabel')}
                  <FormRequiredIndicator />
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder={t('messagePlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormFieldFooter>
                  <FormMessage />
                  <CharacterCount
                    value={field.value}
                    min={limits.message.min}
                    max={limits.message.max}
                  />
                </FormFieldFooter>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="accent"
            className="w-full sm:w-auto"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </form>
      </Form>
    </ContentCard>
  );
}
