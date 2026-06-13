import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import LinkedIn from 'next-auth/providers/linkedin';
import NextAuth from 'next-auth';
import type { Account, Profile } from 'next-auth';
import { logger } from '@/lib/logger';
import {
  linkOAuthAccountToUser,
  mapUserForAuthSession,
  syncOAuthUser,
} from '@/lib/oauth/sync-oauth-user';
import { clearLinkIntent, readLinkIntent } from '@/lib/oauth/link-intent';
import { getEnabledOAuthProviders } from '@/lib/oauth/config';
import { verifyGoogleIdToken } from '@/lib/google/verify-id-token';

export const runtime = 'nodejs';

const enabledOAuthProviders = getEnabledOAuthProviders();

function buildOAuthProviders() {
  const providers = [];

  if (enabledOAuthProviders.google) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  if (enabledOAuthProviders.github) {
    providers.push(
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  if (enabledOAuthProviders.linkedin) {
    providers.push(
      LinkedIn({
        clientId: process.env.AUTH_LINKEDIN_ID,
        clientSecret: process.env.AUTH_LINKEDIN_SECRET,
        client: { token_endpoint_auth_method: 'client_secret_post' },
        issuer: 'https://www.linkedin.com',
        authorization: {
          params: { scope: 'openid profile email' },
        },
        wellKnown:
          'https://www.linkedin.com/oauth/.well-known/openid-configuration',
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
          } as const;
        },
      })
    );
  }

  return providers;
}

function isOAuthProvider(provider?: string) {
  return (
    provider === 'google' ||
    provider === 'github' ||
    provider === 'linkedin' ||
    provider === 'google-one-tap'
  );
}

function getOAuthAccountFromSignIn(
  account: Account,
  profile?: Profile | null
): Parameters<typeof syncOAuthUser>[1] {
  const providerAccountId =
    account.providerAccountId ||
    (profile && 'sub' in profile && typeof profile.sub === 'string'
      ? profile.sub
      : undefined);

  if (!providerAccountId) {
    throw new Error('Missing OAuth provider account id');
  }

  return {
    type: account.type,
    provider: account.provider === 'google-one-tap' ? 'google' : account.provider,
    providerAccountId,
    refresh_token: account.refresh_token,
    access_token: account.access_token,
    expires_at: account.expires_at,
    token_type: account.token_type,
    scope: account.scope,
    id_token: account.id_token,
    session_state:
      typeof account.session_state === 'string' ? account.session_state : null,
  };
}

async function populateTokenFromUser(
  token: Record<string, unknown>,
  user: Awaited<ReturnType<typeof mapUserForAuthSession>>
) {
  token.id = user.id;
  token.email = user.email;
  token.name = user.name;
  token.phone = user.phone;
  token.address = user.address;
  token.website = user.website;
  token.image = user.image;
  token.bio = user.bio;
  token.role = user.role;
  token.createdAt = user.createdAt;
  token.updatedAt = user.updatedAt;
  token.deletedAt = user.deletedAt;
  token.hasPassword = user.hasPassword;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 1 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  trustHost: true,

  providers: [
    ...buildOAuthProviders(),
    ...(enabledOAuthProviders.google
      ? [
          CredentialsProvider({
            id: 'google-one-tap',
            name: 'Google One Tap',
            credentials: {
              credential: { type: 'text' },
            },
            async authorize(credentials) {
              const googleClientId = process.env.AUTH_GOOGLE_ID;
              const credential = credentials?.credential;

              if (!googleClientId || typeof credential !== 'string') {
                return null;
              }

              try {
                const payload = await verifyGoogleIdToken(
                  credential,
                  googleClientId
                );
                const user = await syncOAuthUser(
                  {
                    email: payload.email,
                    name: payload.name,
                    image: payload.picture,
                    emailVerified: payload.email_verified ? new Date() : null,
                  },
                  {
                    type: 'oidc',
                    provider: 'google',
                    providerAccountId: payload.sub,
                    id_token: credential,
                  }
                );

                return mapUserForAuthSession(user);
              } catch (error) {
                logger.warn('Google One Tap verification failed', {
                  error:
                    error instanceof Error ? error.message : 'Unknown error',
                });
                return null;
              }
            },
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const [{ compare }, { prisma }, { checkRateLimit }] = await Promise.all([
          import('bcryptjs'),
          import('./lib/prisma'),
          import('./lib/rate-limit'),
        ]);

        const { email, password } = credentials;
        const emailKey = String(email).toLowerCase();

        const { allowed } = checkRateLimit(
          `login:${emailKey}`,
          5,
          15 * 60 * 1000
        );

        if (!allowed) {
          logger.warn('Login rate limit exceeded', { emailKey });
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: String(email),
          },
        });

        if (!user?.hashedPassword) {
          return null;
        }

        const passwordCorrect = await compare(
          (password as string) || '',
          user.hashedPassword
        );

        if (!passwordCorrect) {
          return null;
        }

        return mapUserForAuthSession(user);
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) {
        return false;
      }

      if (
        account.provider === 'credentials' ||
        account.provider === 'google-one-tap'
      ) {
        return Boolean(user?.email);
      }

      if (!user.email) {
        logger.warn('OAuth sign-in rejected: missing email', {
          provider: account.provider,
        });
        return false;
      }

      try {
        const linkIntent = await readLinkIntent();
        const oauthAccount = getOAuthAccountFromSignIn(account, profile);

        if (linkIntent) {
          await linkOAuthAccountToUser(
            linkIntent.userId,
            {
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
            },
            oauthAccount
          );
          await clearLinkIntent();
          return true;
        }

        await syncOAuthUser(
          {
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: new Date(),
          },
          oauthAccount
        );
        return true;
      } catch (error) {
        await clearLinkIntent();
        logger.error('OAuth sign-in sync failed', {
          provider: account.provider,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user && account && isOAuthProvider(account.provider)) {
        const { prisma } = await import('./lib/prisma');
        const dbUser = token.id
          ? await prisma.user.findUnique({ where: { id: token.id as string } })
          : await prisma.user.findUnique({ where: { email: user.email! } });

        if (dbUser) {
          await populateTokenFromUser(token, mapUserForAuthSession(dbUser));
        }
      } else if (user) {
        await populateTokenFromUser(
          token,
          user as Awaited<ReturnType<typeof mapUserForAuthSession>>
        );
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN';
        session.user.phone = (token.phone as string | undefined) ?? '';
        session.user.address = (token.address as string | undefined) ?? '';
        session.user.website = token.website as string;
        session.user.image = token.image as string;
        session.user.bio = token.bio as string;
        session.user.createdAt = token.createdAt as Date;
        session.user.updatedAt = token.updatedAt as Date;
        session.user.deletedAt = token.deletedAt as Date;
        session.user.hasPassword = Boolean(token.hasPassword);
      }
      return session;
    },
  },
});
