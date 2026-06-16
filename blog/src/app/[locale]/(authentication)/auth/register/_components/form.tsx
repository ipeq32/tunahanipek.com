'use client';

import * as z from 'zod';

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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { authToastError, authToastSuccess } from '@/lib/auth-toast';
import { useForm } from 'react-hook-form';
import { usePathname, useRouter } from '@/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/components/upload/ImageUpload';
import AddressFields from '@/components/address/AddressFields';
import {
  createAddressFormValuesSchema,
  emptyAddressFormValues,
  formValuesToAddressData,
} from '@/lib/address/types';
import { CharacterCount } from '@/components/ui/character-count';
import { FIELD_LIMITS, LIVE_FORM_OPTIONS } from '@/lib/form/field-limits';

export default function RegisterForm() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Authentication.Register');
  const tAddress = useTranslations('Address');

  const FormSchema = useMemo(() => {
    const addressSchema = createAddressFormValuesSchema({
      countryRequired: tAddress('validation.countryRequired'),
      provinceRequired: tAddress('validation.provinceRequired'),
      districtRequired: tAddress('validation.districtRequired'),
      stateRequired: tAddress('validation.stateRequired'),
      cityRequired: tAddress('validation.cityRequired'),
    });

    return z.object({
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
      addressData: addressSchema,
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
          .or(z.literal(''))
      ),
    });
  }, [t, tAddress]);

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
      addressData: { ...emptyAddressFormValues },
      website: undefined,
      image: undefined,
      bio: undefined,
    },
    ...LIVE_FORM_OPTIONS,
  });

  const onSubmit = async (data: FormData) => {

    const {
      email,
      passwordForm: { password, passwordConfirm },
      name,
      phone,
      addressData: addressFormValues,
      website,
      image,
      bio,
    } = data;

    const addressData = formValuesToAddressData(addressFormValues);

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
          addressData,
          website,
          image,
          bio,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        let description: string;

        switch (response.status) {
          case 409:
            description = t('Error.Fail.exist');
            break;
          case 429:
            description = t('Error.Fail.rateLimited');
            break;
          case 403:
            description = t('Error.Fail.registrationDisabled');
            break;
          case 400:
            description =
              data.message ?? t('Error.Fail.validationFailed');
            break;
          default:
            description = t('Error.Fail.responseError');
        }

        authToastError(t('Error.Fail.title'), description);
        return;
      }

      if (pathname === '/auth/register') {
        router.back();
        setTimeout(() => router.push('/auth/login'), 10);
      } else {
        router.push('/auth/login');
      }

      authToastSuccess(t('Error.Ok.title'), t('Error.Ok.description'));
    } catch {
      authToastError(t('Error.Fail.title'), t('Error.Fail.description'));
    }
  };

  return (
    <Form {...form}>
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center gap-2">
              <FormLabel className="text-xs font-medium text-muted-foreground">
                {t('Form.Avatar.label')}
              </FormLabel>
              <FormControl>
                <ImageUpload
                  variant="avatar"
                  endpoint="avatarUploader"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage className="text-xs text-rose-400" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-foreground">
                  {t('Form.Email.label')}
                  <FormRequiredIndicator />
                </FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    type="email"
                    placeholder={t('Form.Email.placeholder')}
                    {...field}
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
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-foreground">
                  {t('Form.Name.label')}
                  <FormRequiredIndicator />
                </FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder={t('Form.Name.placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormFieldFooter>
                  <FormMessage className="text-xs text-rose-400" />
                  <CharacterCount
                    value={field.value}
                    min={FIELD_LIMITS.register.name.min}
                  />
                </FormFieldFooter>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordForm.password"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-foreground">
                  {t('Form.Password.label')}
                  <FormRequiredIndicator />
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    className="w-full"
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
          <FormField
            control={form.control}
            name="passwordForm.passwordConfirm"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-foreground">
                  {t('Form.PasswordConfirm.label')}
                  <FormRequiredIndicator />
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    className="w-full"
                    placeholder={t('Form.PasswordConfirm.placeholder')}
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
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-foreground">
                  {t('Form.Phone.label')}
                  <FormRequiredIndicator />
                </FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder={t('Form.Phone.placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormFieldFooter>
                  <FormMessage className="text-xs text-rose-400" />
                  <CharacterCount
                    value={field.value}
                    min={FIELD_LIMITS.register.phone.min}
                  />
                </FormFieldFooter>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-foreground">
                  {t('Form.Website.label')}
                </FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder={t('Form.Website.placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-rose-400" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="addressData"
            render={() => (
              <FormItem className="w-full sm:col-span-2">
                <FormControl>
                  <AddressFields
                    control={form.control}
                    name="addressData"
                    variant="register"
                  />
                </FormControl>
                <FormMessage className="text-xs text-rose-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-foreground">
                  {t('Form.Bio.label')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full resize-none"
                    placeholder={t('Form.Bio.placeholder')}
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormFieldFooter>
                  <FormMessage className="text-xs text-rose-400" />
                  <CharacterCount
                    value={field.value ?? ''}
                    min={FIELD_LIMITS.register.bio.min}
                  />
                </FormFieldFooter>
              </FormItem>
            )}
          />
        </div>

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
      </motion.form>
    </Form>
  );
}
