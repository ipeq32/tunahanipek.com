'use client';

import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { ContentCard } from '@/components/layout/content-card';
import { KeyRound, type LucideIcon, UserRound } from 'lucide-react';
import { ReactNode } from 'react';

const profileSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  address: z.string().min(10),
  website: z.string().url().optional().or(z.literal('')),
  image: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    newPasswordConfirm: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: 'Passwords do not match',
    path: ['newPasswordConfirm'],
  });

export type SettingsUserValues = {
  name: string;
  phone: string;
  address: string;
  website: string;
  image: string;
  bio: string;
};

type SettingsFormProps = {
  initialUser: SettingsUserValues;
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

export default function SettingsForm({ initialUser }: SettingsFormProps) {
  const { update } = useSession();
  const t = useTranslations('Settings');

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialUser,
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    },
  });

  const watchedImage = profileForm.watch('image');
  const watchedName = profileForm.watch('name');

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }
      );
      if (!res.ok) throw new Error('Failed');
      await update();
      toast.success(t('profileSuccess'));
    } catch {
      toast.error(t('profileError'));
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/password`,
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
      toast.success(t('passwordSuccess'));
    } catch {
      toast.error(t('passwordError'));
    }
  };

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
            className="space-y-5"
          >
            <div className="flex items-center gap-4 rounded-xl border border-border/40 bg-background/40 p-4">
              <Avatar className="h-16 w-16 rounded-2xl ring-2 ring-teal-500/20">
                <AvatarImage src={watchedImage || undefined} alt={watchedName} />
                <AvatarFallback className="rounded-2xl text-lg">
                  {watchedName?.charAt(0).toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <FormField
                control={profileForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t('image')}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FieldGrid>
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phone')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGrid>

            <FormField
              control={profileForm.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('website')}</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('address')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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

            <div className="flex justify-end border-t border-border/40 pt-4">
              <Button
                type="submit"
                variant="accent"
                disabled={profileForm.formState.isSubmitting}
              >
                {profileForm.formState.isSubmitting
                  ? t('saving')
                  : t('saveProfile')}
              </Button>
            </div>
          </form>
        </Form>
      </ContentCard>

      <ContentCard>
        <SectionHeader
          icon={KeyRound}
          title={t('passwordTitle')}
          description={t('passwordDescription')}
        />
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-5"
          >
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('currentPassword')}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FieldGrid>
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPasswordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newPasswordConfirm')}</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGrid>

            <div className="flex justify-end border-t border-border/40 pt-4">
              <Button
                type="submit"
                variant="accent"
                disabled={passwordForm.formState.isSubmitting}
              >
                {passwordForm.formState.isSubmitting
                  ? t('saving')
                  : t('savePassword')}
              </Button>
            </div>
          </form>
        </Form>
      </ContentCard>
    </div>
  );
}
