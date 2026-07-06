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
import { FIELD_LIMITS, LIVE_FORM_OPTIONS } from '@/lib/form/field-limits';
import { useFormSubmitDisabled } from '@/lib/form/submit-state';
import { MessageSquare, SendHorizontal } from 'lucide-react';

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

  const submitDisabled = useFormSubmitDisabled(form.control);

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
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
      <div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl"
        aria-hidden
      />

      <div className="relative p-6 md:p-8">
        <div className="mb-8 flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/20 dark:text-teal-400">
            <MessageSquare className="h-5 w-5" aria-hidden />
          </span>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">{t('title')}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
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
                      rows={6}
                      placeholder={t('messagePlaceholder')}
                      className="min-h-[140px] resize-y"
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
            <div className="flex flex-col gap-3 border-t border-border/50 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">{t('privacyNote')}</p>
              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full sm:w-auto"
                disabled={submitDisabled}
              >
                {form.formState.isSubmitting ? (
                  t('submitting')
                ) : (
                  <>
                    {t('submit')}
                    <SendHorizontal className="ml-2 h-4 w-4" aria-hidden />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
