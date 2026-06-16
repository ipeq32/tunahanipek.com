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

import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SignInResponse } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import {
  authToastError,
  authToastSuccess,
  firstFieldErrorMessage,
  mapSignInError,
} from '@/lib/auth-toast';
import type { FieldErrors } from 'react-hook-form';
import { FIELD_LIMITS, LIVE_FORM_OPTIONS } from '@/lib/form/field-limits';
import { CharacterCount } from '@/components/ui/character-count';
import {
  FormFieldFooter,
  FormRequiredIndicator,
} from '@/components/ui/form';

import type { EnabledOAuthProviders } from '@/lib/oauth/config';

type LoginFormProps = {
  setOpenModal?: (value: boolean) => void;
  enabledProviders?: EnabledOAuthProviders;
  showOAuth?: boolean;
};

export default function LoginForm({
  setOpenModal,
  enabledProviders,
  showOAuth = false,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const t = useTranslations('Authentication.Login');

  useEffect(() => {
    const error = searchParams.get('error');
    if (!error) {
      return;
    }

    authToastError(
      t('Error.Fail.title'),
      mapSignInError(error, (key) => t(`Error.Fail.${key}`))
    );
  }, [searchParams, t]);

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
    ...LIVE_FORM_OPTIONS,
  });

  const onInvalid = (errors: FieldErrors<FormData>) => {
    const message =
      firstFieldErrorMessage(errors) ?? t('Error.Fail.description');
    authToastError(t('Error.Fail.title'), message);
  };

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;

    try {
      const response: SignInResponse | undefined = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!response) {
        authToastError(t('Error.Fail.title'), t('Error.Fail.description'));
        return;
      }

      if (!response.ok || response.error) {
        authToastError(
          t('Error.Fail.title'),
          mapSignInError(response.error, (key) => t(`Error.Fail.${key}`))
        );
        return;
      }

      if (setOpenModal) {
        setOpenModal(false);
      }

      const callbackPath = searchParams.get('callback');
      if (callbackPath?.startsWith('/')) {
        window.location.assign(callbackPath);
        return;
      }

      router.push('/');
      router.refresh();
      authToastSuccess(t('Error.Ok.title'), t('Error.Ok.description'));
    } catch {
      authToastError(t('Error.Fail.title'), t('Error.Fail.description'));
    }
  };

  return (
    <Form {...form}>
      <motion.div
        animate={{
          scale: [0.5, 1],
          opacity: [0, 1],
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="flex flex-col items-start justify-center text-white rounded-lg gap-y-6 mt-5"
        >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-xs text-black dark:text-white">
                {t('Form.Email.label')}
                <FormRequiredIndicator />
              </FormLabel>
              <FormControl className="w-full">
                <Input
                  className="text-black dark:text-white w-full"
                  placeholder={t('Form.Email.placeholder')}
                  {...field}
                  type="email"
                />
              </FormControl>
              <FormFieldFooter>
                <FormMessage className="text-xs text-rose-400" />
                <CharacterCount
                  value={field.value}
                  max={FIELD_LIMITS.contact.email.max}
                />
              </FormFieldFooter>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-xs text-black dark:text-white">
                {t('Form.Password.label')}
                <FormRequiredIndicator />
              </FormLabel>
              <FormControl className="w-full">
                <PasswordInput
                  className="text-black dark:text-white w-full"
                  placeholder={t('Form.Password.placeholder')}
                  {...field}
                />
              </FormControl>
              <FormFieldFooter>
                <FormMessage className="text-xs text-rose-400" />
                <CharacterCount
                  value={field.value}
                  min={FIELD_LIMITS.password.min}
                  trim={false}
                />
              </FormFieldFooter>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="accent"
          className="w-full"
          disabled={form.formState.isSubmitting || !form.formState.isValid}
        >
          {form.formState.isSubmitting
            ? t('Form.Submit.loading')
            : t('Form.Submit.label')}
        </Button>
        <OAuthButtons
          setOpenModal={setOpenModal}
          enabledProviders={enabledProviders}
          showOAuth={showOAuth}
        />
        </form>
      </motion.div>
    </Form>
  );
}
