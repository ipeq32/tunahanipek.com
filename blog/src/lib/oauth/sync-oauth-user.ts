import type { Account, User } from '@prisma/client';
import { getDefaultAccessRoleId } from '@/lib/auth/access-roles';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export type OAuthAccountInput = {
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
};

export type OAuthProfileInput = {
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
};

export type SyncOAuthUserResult = User & { accounts: Account[] };

function buildAccountData(account: OAuthAccountInput) {
  return {
    type: account.type,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    refresh_token: account.refresh_token ?? null,
    access_token: account.access_token ?? null,
    expires_at: account.expires_at ?? null,
    token_type: account.token_type ?? null,
    scope: account.scope ?? null,
    id_token: account.id_token ?? null,
    session_state: account.session_state ?? null,
  };
}

export async function linkOAuthAccountToUser(
  userId: string,
  profile: OAuthProfileInput,
  account: OAuthAccountInput
): Promise<SyncOAuthUserResult> {
  const accountData = buildAccountData(account);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: true },
  });

  if (!user) {
    throw new Error('User not found for OAuth account linking');
  }

  const profileEmail = profile.email.toLowerCase().trim();
  if (profileEmail !== user.email.toLowerCase()) {
    throw new Error('OAuth email does not match account email');
  }

  const existingProviderAccount = user.accounts.find(
    (item) => item.provider === account.provider
  );

  const conflictingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    },
  });

  if (
    conflictingAccount &&
    conflictingAccount.userId !== userId
  ) {
    throw new Error('OAuth account is already linked to another user');
  }

  if (existingProviderAccount) {
    await prisma.account.update({
      where: { id: existingProviderAccount.id },
      data: accountData,
    });
  } else {
    await prisma.account.create({
      data: {
        userId,
        ...accountData,
      },
    });
  }

  if (!user.image && profile.image) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        image: profile.image,
        emailVerified: user.emailVerified ?? profile.emailVerified ?? null,
      },
    });
  }

  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { accounts: true },
  });
}

export async function syncOAuthUser(
  profile: OAuthProfileInput,
  account: OAuthAccountInput
): Promise<SyncOAuthUserResult> {
  const email = profile.email.toLowerCase().trim();
  const accountData = buildAccountData(account);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (existingUser) {
    const linkedAccount = existingUser.accounts.find(
      (item) =>
        item.provider === account.provider &&
        item.providerAccountId === account.providerAccountId
    );

    if (!linkedAccount) {
      await prisma.account.create({
        data: {
          userId: existingUser.id,
          ...accountData,
        },
      });
    } else {
      await prisma.account.update({
        where: { id: linkedAccount.id },
        data: accountData,
      });
    }

    const shouldUpdateProfile =
      (!existingUser.image && profile.image) ||
      (!existingUser.emailVerified && profile.emailVerified);

    if (shouldUpdateProfile) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          image: existingUser.image ?? profile.image ?? null,
          emailVerified: existingUser.emailVerified ?? profile.emailVerified ?? null,
        },
      });
    }

    return prisma.user.findUniqueOrThrow({
      where: { id: existingUser.id },
      include: { accounts: true },
    });
  }

  const defaultAccessRoleId = await getDefaultAccessRoleId();

  const createdUser = await prisma.user.create({
    data: {
      email,
      name: profile.name?.trim() || email.split('@')[0] || 'User',
      image: profile.image ?? null,
      emailVerified: profile.emailVerified ?? new Date(),
      accessRoleId: defaultAccessRoleId,
      accounts: {
        create: accountData,
      },
    },
    include: { accounts: true },
  });

  logger.info('OAuth user created', {
    userId: createdUser.id,
    provider: account.provider,
  });

  return createdUser;
}

export function mapUserForAuthSession(user: User) {
  const { hashedPassword, ...userData } = user;

  return {
    ...userData,
    phone: user.phone ?? undefined,
    address: user.address ?? undefined,
    website: user.website ?? undefined,
    image: user.image ?? undefined,
    bio: user.bio ?? undefined,
    deletedAt: user.deletedAt ?? undefined,
    hasPassword: Boolean(hashedPassword),
  };
}
