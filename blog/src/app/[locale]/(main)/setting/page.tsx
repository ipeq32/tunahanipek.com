import HeaderTemplate from '@/components/templates/HeaderTemplate';
import SettingsForm from './_features/SettingsForm';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import {
  addressDataToFormValues,
  parseAddressDataJson,
} from '@/lib/address/types';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';

export default async function SettingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations('Settings');

  if (!session?.user?.id) {
    return redirect({
      href: {
        pathname: '/auth/login',
        query: { callback: '/setting' },
      },
      locale,
    });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      phone: true,
      addressData: true,
      website: true,
      image: true,
      bio: true,
      role: true,
    },
  });

  if (!dbUser) {
    return redirect({ href: '/auth/login', locale });
  }

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <SettingsForm
        isSuperAdmin={isSuperAdmin(dbUser.role)}
        initialUser={{
          name: dbUser.name ?? '',
          phone: dbUser.phone ?? '',
          addressData: addressDataToFormValues(
            parseAddressDataJson(dbUser.addressData)
          ),
          website: dbUser.website ?? '',
          image: dbUser.image ?? '',
          bio: dbUser.bio ?? '',
        }}
      />
    </>
  );
}
