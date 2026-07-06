'use client';

import { useSession } from 'next-auth/react';
import {
  useForm,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/upload/ImageUpload';
import { useUploadCleanup } from '@/components/upload/use-upload-cleanup';
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
import { CharacterCount } from '@/components/ui/character-count';
import { FIELD_LIMITS, LIVE_FORM_OPTIONS } from '@/lib/form/field-limits';
import {
  useFormSubmitDisabled,
} from '@/lib/form/submit-state';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { ContentCard } from '@/components/layout/content-card';
import {
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  type LucideIcon,
  UserRound,
} from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import AiSettingsSection from './AiSettingsSection';
import ConnectedAccountsSection from './ConnectedAccountsSection';
import ResumeSettingsSection from './ResumeSettingsSection';
import AddressFields from '@/components/address/AddressFields';
import {
  createAddressFormValuesSchema,
  formValuesToAddressData,
  type AddressFormValues,
} from '@/lib/address/types';
import {
  formatPhoneDigits,
  parsePhoneDigits,
} from '@/lib/contact/display';
import type { EnabledOAuthProviders, OAuthProviderId } from '@/lib/oauth/config';

function createProfileSchema(
  t: (key: string, values?: Record<string, string | number>) => string,
  addressSchema: ReturnType<typeof createAddressFormValuesSchema>,
  includeContactEmail: boolean
) {
  return z.object({
    name: z.string().min(FIELD_LIMITS.profile.name.min, {
      message: t('validation.nameMin', { min: FIELD_LIMITS.profile.name.min }),
    }),
    phone: z.string().refine(
      (value) =>
        parsePhoneDigits(value).length >= FIELD_LIMITS.profile.phone.min,
      {
        message: t('validation.phoneMin', {
          min: FIELD_LIMITS.profile.phone.min,
        }),
      }
    ),
    addressData: addressSchema,
    website: z
      .string()
      .url({ message: t('validation.websiteInvalid') })
      .optional()
      .or(z.literal('')),
    contactEmail: includeContactEmail
      ? z
          .string()
          .email({ message: t('validation.contactEmailInvalid') })
          .max(FIELD_LIMITS.contact.email.max)
          .optional()
          .or(z.literal(''))
      : z.literal('').optional(),
    image: z
      .string()
      .url({ message: t('validation.imageInvalid') })
      .optional()
      .or(z.literal('')),
    bio: z.string().optional().or(z.literal('')),
  });
}

function createPasswordFormSchema(
  t: (key: string, values?: Record<string, string | number>) => string,
  requireCurrentPassword: boolean
) {
  const passwordMin = FIELD_LIMITS.password.min;

  return z
    .object({
      currentPassword: requireCurrentPassword
        ? z.string().min(passwordMin, {
            message: t('validation.passwordMin', { min: passwordMin }),
          })
        : z.string().optional(),
      newPassword: z.string().min(passwordMin, {
        message: t('validation.passwordMin', { min: passwordMin }),
      }),
      newPasswordConfirm: z.string().min(passwordMin, {
        message: t('validation.passwordMin', { min: passwordMin }),
      }),
    })
    .refine((data) => data.newPassword === data.newPasswordConfirm, {
      message: t('validation.passwordMismatch'),
      path: ['newPasswordConfirm'],
    });
}

export type SettingsUserValues = {
  name: string;
  phone: string;
  addressData: AddressFormValues;
  website: string;
  contactEmail?: string;
  image: string;
  bio: string;
};

type SiteResumeInitial = {
  url: string;
  fileName: string;
  updatedAt: string;
} | null;

type SettingsFormProps = {
  initialUser: SettingsUserValues;
  canManageSiteSettings?: boolean;
  isSiteOwner?: boolean;
  initialSiteResume?: SiteResumeInitial;
  linkedProviders?: OAuthProviderId[];
  enabledProviders?: EnabledOAuthProviders;
  showConnectedAccounts?: boolean;
};

type SectionHeaderProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function SectionHeader({ icon: Icon, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-lg font-semibold leading-tight tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

type IconFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  icon: LucideIcon;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  countTrim?: boolean;
};

function IconField<T extends FieldValues>({
  control,
  name,
  label,
  icon: Icon,
  placeholder,
  type = 'text',
  autoComplete,
  required = false,
  minLength,
  maxLength,
  countTrim = true,
}: IconFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required ? <FormRequiredIndicator /> : null}
          </FormLabel>
          <div className="relative">
            <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <FormControl>
              {type === 'password' ? (
                <PasswordInput
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  className="pl-9"
                  {...field}
                />
              ) : (
                <Input
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  className="pl-9"
                  {...field}
                />
              )}
            </FormControl>
          </div>
          <FormFieldFooter>
            <FormMessage />
            {(minLength !== undefined || maxLength !== undefined) && (
              <CharacterCount
                value={String(field.value ?? '')}
                min={minLength}
                max={maxLength}
                trim={countTrim}
              />
            )}
          </FormFieldFooter>
        </FormItem>
      )}
    />
  );
}

export default function SettingsForm({
  initialUser,
  canManageSiteSettings = false,
  isSiteOwner = false,
  initialSiteResume = null,
  linkedProviders = [],
  enabledProviders,
  showConnectedAccounts = false,
}: SettingsFormProps) {
  const { data: session, update } = useSession();
  const t = useTranslations('Settings');
  const tAddress = useTranslations('Address');
  const imageCleanup = useUploadCleanup();
  const hasPassword = session?.user?.hasPassword ?? true;

  const addressSchema = useMemo(
    () =>
      createAddressFormValuesSchema({
        countryRequired: tAddress('validation.countryRequired'),
        provinceRequired: tAddress('validation.provinceRequired'),
        districtRequired: tAddress('validation.districtRequired'),
        stateRequired: tAddress('validation.stateRequired'),
        cityRequired: tAddress('validation.cityRequired'),
      }),
    [tAddress]
  );

  const profileSchema = useMemo(
    () => createProfileSchema(t, addressSchema, isSiteOwner),
    [addressSchema, isSiteOwner, t]
  );

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialUser,
    ...LIVE_FORM_OPTIONS,
  });

  type PasswordFormValues = z.infer<ReturnType<typeof createPasswordFormSchema>>;

  const passwordSchema = useMemo(
    () => createPasswordFormSchema(t, hasPassword),
    [hasPassword, t]
  );

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    },
    ...LIVE_FORM_OPTIONS,
  });

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const addressData = formValuesToAddressData(values.addressData);
      const res = await fetch(
        `/api/user/profile`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: values.name,
            phone: values.phone,
            addressData,
            website: values.website,
            contactEmail: isSiteOwner ? values.contactEmail : undefined,
            image: values.image,
            bio: values.bio,
          }),
        }
      );
      if (!res.ok) throw new Error('Failed');
      // Görsel kaydedildi; oturum temizliğinde silinmesini engelle.
      imageCleanup.commit();
      await update();
      toast.success(t('profileSuccess'));
    } catch {
      toast.error(t('profileError'));
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    try {
      const res = await fetch(
        `/api/user/password`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      passwordForm.reset();
      await update();
      toast.success(t('passwordSuccess'));
    } catch {
      toast.error(t('passwordError'));
    }
  };

  const profileSubmitDisabled = useFormSubmitDisabled(profileForm.control, {
    requireDirty: true,
  });
  const passwordSubmitDisabled = useFormSubmitDisabled(passwordForm.control);
  const profileSubmitting = profileForm.formState.isSubmitting;
  const passwordSubmitting = passwordForm.formState.isSubmitting;

  return (
    <div className="mt-2 space-y-6">
      <ContentCard>
        <SectionHeader
          icon={UserRound}
          title={t('profileTitle')}
          description={t('profileDescription')}
        />
        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <FormField
                control={profileForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('image')}</FormLabel>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={profileSubmitting}
                      heightClassName="h-48"
                      endpoint="profileImageUploader"
                      cleanup={imageCleanup}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-5">
                <FieldGrid>
                  <IconField
                    control={profileForm.control}
                    name="name"
                    label={t('name')}
                    icon={UserRound}
                    required
                    minLength={FIELD_LIMITS.profile.name.min}
                  />
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('phone')}
                          <FormRequiredIndicator />
                        </FormLabel>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <FormControl>
                            <Input
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="+90 (5__) ___-____"
                              className="pl-9"
                              value={formatPhoneDigits(String(field.value ?? ''))}
                              onChange={(event) => {
                                field.onChange(
                                  parsePhoneDigits(event.target.value),
                                );
                              }}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                        </div>
                        <FormFieldFooter>
                          <FormMessage />
                          <CharacterCount
                            value={parsePhoneDigits(String(field.value ?? ''))}
                            min={FIELD_LIMITS.profile.phone.min}
                            max={FIELD_LIMITS.profile.phone.min}
                          />
                        </FormFieldFooter>
                      </FormItem>
                    )}
                  />
                </FieldGrid>

                <IconField
                  control={profileForm.control}
                  name="website"
                  label={t('website')}
                  icon={Globe}
                  placeholder={t('urlPlaceholder')}
                />

                {isSiteOwner && (
                  <IconField
                    control={profileForm.control}
                    name="contactEmail"
                    label={t('contactEmail')}
                    icon={Mail}
                    type="email"
                    placeholder={t('contactEmailPlaceholder')}
                    maxLength={FIELD_LIMITS.contact.email.max}
                  />
                )}

                <FormField
                  control={profileForm.control}
                  name="addressData"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <AddressFields
                          control={profileForm.control}
                          name="addressData"
                          variant="settings"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('bio')}</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-border/40 pt-4">
              <Button
                type="submit"
                variant="accent"
                disabled={profileSubmitDisabled}
              >
                {profileSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {profileSubmitting ? t('saving') : t('saveProfile')}
              </Button>
            </div>
          </form>
        </Form>
      </ContentCard>

      {showConnectedAccounts && enabledProviders && (
        <ConnectedAccountsSection
          linkedProviders={linkedProviders}
          enabledProviders={enabledProviders}
        />
      )}

      <ContentCard>
        <SectionHeader
          icon={KeyRound}
          title={hasPassword ? t('passwordTitle') : t('setPasswordTitle')}
          description={
            hasPassword ? t('passwordDescription') : t('setPasswordDescription')
          }
        />
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-5"
          >
            {hasPassword && (
              <IconField
                control={passwordForm.control}
                name="currentPassword"
                label={t('currentPassword')}
                icon={Lock}
                type="password"
                autoComplete="current-password"
                required
                minLength={FIELD_LIMITS.password.min}
                countTrim={false}
              />
            )}
            <FieldGrid>
              <IconField
                control={passwordForm.control}
                name="newPassword"
                label={t('newPassword')}
                icon={KeyRound}
                type="password"
                autoComplete="new-password"
                required
                minLength={FIELD_LIMITS.password.min}
                countTrim={false}
              />
              <IconField
                control={passwordForm.control}
                name="newPasswordConfirm"
                label={t('newPasswordConfirm')}
                icon={KeyRound}
                type="password"
                autoComplete="new-password"
                required
                minLength={FIELD_LIMITS.password.min}
                countTrim={false}
              />
            </FieldGrid>

            <div className="flex justify-end border-t border-border/40 pt-4">
              <Button
                type="submit"
                variant="accent"
                disabled={passwordSubmitDisabled}
              >
                {passwordSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {passwordSubmitting ? t('saving') : hasPassword ? t('savePassword') : t('setPassword')}
              </Button>
            </div>
          </form>
        </Form>
      </ContentCard>

      {canManageSiteSettings && (
        <ResumeSettingsSection initialResume={initialSiteResume} />
      )}
      {canManageSiteSettings && <AiSettingsSection />}
    </div>
  );
}
