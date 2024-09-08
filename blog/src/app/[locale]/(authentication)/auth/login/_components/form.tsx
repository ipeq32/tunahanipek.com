'use client';

import * as z from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SignInResponse } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

type LoginFormProps = {
  setOpenModal?: (value: boolean) => void;
};

export default function LoginForm({ setOpenModal }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const t = useTranslations('Authentication.Login');

  const FormSchema = z.object({
    email: z.string().email({
      message: t('Schema.Email.emailMessage'),
    }),
    password: z.string().min(6, {
      message: t('Schema.Password.minMessage'),
    }),
  });

  type FormData = z.infer<typeof FormSchema>;

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;

    try {
      const response: SignInResponse | undefined = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!response?.error) {
        if (setOpenModal) {
          setOpenModal(false);
        }
        router.push(searchParams.get('callback') || '/');
        router.refresh();
        toast(t('Error.Ok.title'), { description: t('Error.Ok.description') });
      }

      if (!response?.ok) {
        throw new Error(t('Error.Fail.responseError'));
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast(t('Error.Fail.title'), { description: error.message });
      } else {
        toast(t('Error.Fail.title'), {
          description: t('Error.Fail.description'),
        });
      }
    }
  };

  return (
    <Form {...form}>
      <motion.form
        animate={{
          scale: [0.5, 1],
          opacity: [0, 1],
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-start justify-center text-white rounded-lg gap-y-6 mt-5"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-xs text-black dark:text-white">
                {t('Form.Email.label')} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl className="w-full">
                <Input
                  className="text-black dark:text-white w-full"
                  placeholder={t('Form.Email.placeholder')}
                  {...field}
                  type="email"
                  required
                />
              </FormControl>
              <FormMessage {...field} className="text-xs text-rose-300" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-xs text-black dark:text-white">
                {t('Form.Password.label')}{' '}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl className="w-full">
                <Input
                  className="text-black dark:text-white w-full"
                  placeholder={t('Form.Password.placeholder')}
                  {...field}
                  type="password"
                />
              </FormControl>
              <FormMessage {...field} className="text-xs text-rose-300" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="hover:scale-105 w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? t('Form.Submit.loading')
            : t('Form.Submit.label')}
        </Button>
      </motion.form>
    </Form>
  );
}
