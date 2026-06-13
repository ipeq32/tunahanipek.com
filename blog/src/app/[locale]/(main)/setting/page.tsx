import HeaderTemplate from '@/components/templates/HeaderTemplate';
import SettingsForm from './_features/SettingsForm';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import { getSiteResumeDirect } from '@/lib/site-resume';
import {
  addressDataToFormValues,
  parseAddressDataJson,
} from '@/lib/address/types';
import { prisma } from '@/lib/prisma';
import {
  getEnabledOAuthProviders,
  hasAnyOAuthProvider,
  type OAuthProviderId,
} from '@/lib/oauth/config';
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

  const [dbUser, enabledProviders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        phone: true,
        addressData: true,
        website: true,
        image: true,
        bio: true,
        role: true,
        accounts: {
          select: { provider: true },
          orderBy: { provider: 'asc' },
        },
      },
    }),
    Promise.resolve(getEnabledOAuthProviders()),
  ]);

  if (!dbUser) {
    return redirect({ href: '/auth/login', locale });
  }

  const userIsSuperAdmin = isSuperAdmin(dbUser.role);

  const initialSiteResume = userIsSuperAdmin ? await getSiteResumeDirect() : null;

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <SettingsForm
        isSuperAdmin={userIsSuperAdmin}
        initialSiteResume={
          initialSiteResume
            ? {
                url: initialSiteResume.url,
                fileName: initialSiteResume.fileName,
                updatedAt: initialSiteResume.updatedAt.toISOString(),
              }
            : null
        }
        linkedProviders={dbUser.accounts
          .map((account) => account.provider)
          .filter((provider): provider is OAuthProviderId =>
            ['google', 'github', 'linkedin'].includes(provider)
          )}
        enabledProviders={enabledProviders}
        showConnectedAccounts={hasAnyOAuthProvider(enabledProviders)}
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
