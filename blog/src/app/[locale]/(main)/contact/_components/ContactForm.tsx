'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ContentCard } from '@/components/layout/content-card';

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  message: z.string().trim().min(10).max(5000),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const t = useTranslations('Pages.Contact.Form');
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contact`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        },
      );
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
                <FormLabel>{t('nameLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('namePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('emailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('messageLabel')}</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder={t('messagePlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="accent"
            className="w-full sm:w-auto"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </form>
      </Form>
    </ContentCard>
  );
}
