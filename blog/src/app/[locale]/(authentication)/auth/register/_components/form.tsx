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
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { usePathname, useRouter } from '@/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRecoilState } from 'recoil';
import { authAtom } from '@/recoil';

export default function RegisterForm() {
  const [isOpened] = useRecoilState(authAtom.registerModalState);

  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Authentication.Register');

  const FormSchema = z.object({
    email: z
      .string({
        required_error: t('Schema.Email.stringRequiredError'),
        invalid_type_error: t('Schema.Email.stringInvalidTypeError'),
      })
      .email({
        message: t('Schema.Email.emailMessage'),
      }),
    passwordForm: z
      .object({
        password: z
          .string({
            required_error: t('Schema.Password.stringRequiredError'),
            invalid_type_error: t('Schema.Password.stringInvalidTypeError'),
          })
          .min(6, {
            message: t('Schema.Password.minMessage'),
          }),
        passwordConfirm: z
          .string({
            required_error: t('Schema.PasswordConfirm.stringRequiredError'),
            invalid_type_error: t(
              'Schema.PasswordConfirm.stringInvalidTypeError'
            ),
          })
          .min(6, {
            message: t('Schema.PasswordConfirm.minMessage'),
          }),
      })
      .refine((data) => data.password === data.passwordConfirm, {
        message: t('Schema.PasswordConfirm.refineMessage'),
        path: ['passwordConfirm'],
      }),
    name: z
      .string({
        required_error: t('Schema.Name.stringRequiredError'),
        invalid_type_error: t('Schema.Name.stringInvalidTypeError'),
      })
      .min(3, {
        message: t('Schema.Name.minMessage'),
      }),
    phone: z
      .string({
        required_error: t('Schema.Phone.stringRequiredError'),
        invalid_type_error: t('Schema.Phone.stringInvalidTypeError'),
      })
      .min(10, {
        message: t('Schema.Phone.minMessage'),
      }),
    address: z
      .string({
        required_error: t('Schema.Address.stringRequiredError'),
        invalid_type_error: t('Schema.Address.stringInvalidTypeError'),
      })
      .min(10, {
        message: t('Schema.Address.minMessage'),
      }),
    website: z.optional(
      z
        .string({
          invalid_type_error: t('Schema.Website.stringInvalidTypeError'),
        })
        .url({
          message: t('Schema.Website.urlMessage'),
        })
    ),
    image: z.optional(
      z
        .string({
          invalid_type_error: t('Schema.Image.stringInvalidTypeError'),
        })
        .url({
          message: t('Schema.Image.urlMessage'),
        })
    ),
    bio: z.optional(
      z
        .string({
          invalid_type_error: t('Schema.Bio.stringInvalidTypeError'),
        })
        .min(10, {
          message: t('Schema.Bio.minMessage'),
        })
    ),
  });

  type FormData = z.infer<typeof FormSchema>;

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      passwordForm: {
        password: '',
        passwordConfirm: '',
      },
      name: '',
      phone: '',
      address: '',
      website: undefined,
      image: undefined,
      bio: undefined,
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('Submitting form', data);

    const {
      email,
      passwordForm: { password, passwordConfirm },
      name,
      phone,
      address,
      website,
      image,
      bio,
    } = data;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          passwordConfirm,
          name,
          phone,
          address,
          website,
          image,
          bio,
        }),
      });
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(t('Error.Fail.exist'));
        }

        throw new Error(t('Error.Fail.responseError'));
      }

      if (pathname === '/auth/register') {
        router.back();
        setTimeout(() => router.push('/auth/login'), 10);
      } else {
        router.push('/auth/login');
      }

      // Process response here
      toast(t('Error.Ok.title'), { description: t('Error.Ok.description') });
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
        className="flex flex-col gap-10"
      >
        <div className="flex flex-wrap gap-5 text-white rounded-lg gap-y-6 mt-5 w-full overflow-y-scroll">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem
                className={`${isOpened ? 'md:max-w-[48.3%]' : ''} w-full`}
              >
                <FormLabel className="text-xs text-black dark:text-white">
                  {t('Form.Email.label')}{' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl className="w-full">
                  <Input
                    className="text-black dark:text-white w-full"
                    placeholder={t('Form.Email.placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordForm.password"
            render={({ field }) => (
              <FormItem
                className={`${isOpened ? 'md:max-w-[48.3%]' : ''} w-full`}
              >
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
          <FormField
            control={form.control}
            name="passwordForm.passwordConfirm"
            render={({ field }) => (
              <FormItem
                className={`${isOpened ? 'md:max-w-[48.3%]' : ''} w-full`}
              >
                <FormLabel className="text-xs text-black dark:text-white">
                  {t('Form.PasswordConfirm.label')}{' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl className="w-full">
                  <Input
                    className="text-black dark:text-white w-full"
                    placeholder={t('Form.PasswordConfirm.placeholder')}
                    {...field}
                    type="password"
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem
                className={`${isOpened ? 'md:max-w-[48.3%]' : ''} w-full`}
              >
                <FormLabel className="text-xs text-black dark:text-white">
                  {t('Form.Name.label')} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl className="w-full">
                  <Input
                    className="text-black dark:text-white w-full"
                    placeholder={t('Form.Name.placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem
                className={`${isOpened ? 'md:max-w-[48.3%]' : ''} w-full`}
              >
                <FormLabel className="text-xs text-black dark:text-white">
                  {t('Form.Phone.label')}{' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl className="w-full">
                  <Input
                    className="text-black dark:text-white w-full"
                    placeholder={t('Form.Phone.placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem
                className={`${isOpened ? 'md:max-w-[48.3%]' : ''} w-full`}
              >
                <FormLabel className="text-xs text-black dark:text-white">
                  {t('Form.ImageURL.label')}
                </FormLabel>
                <FormControl className="w-full">
                  <Input
                    className="text-black dark:text-white w-full"
                    placeholder={t('Form.ImageURL.placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-xs text-black dark:text-white">
                {t('Form.Website.label')}
              </FormLabel>
              <FormControl className="w-full">
                <Input
                  className="text-black dark:text-white w-full"
                  placeholder={t('Form.Website.placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage {...field} className="text-xs text-rose-300" />
            </FormItem>
          )}
        />
        <div className="flex max-sm:flex-col gap-5">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-black dark:text-white">
                  {t('Form.Address.label')}{' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl className="w-full">
                  <Textarea
                    className="text-black dark:text-white w-full"
                    placeholder={t('Form.Address.placeholder')}
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-black dark:text-white">
                  {t('Form.Bio.label')}
                </FormLabel>
                <FormControl className="w-full">
                  <Textarea
                    className="text-black dark:text-white w-full"
                    placeholder={t('Form.Bio.placeholder')}
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
        </div>
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
