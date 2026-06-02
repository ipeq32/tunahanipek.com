import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';

export const runtime = 'nodejs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 1 * 24 * 60 * 60, // 1 day
  },

  pages: {
    signIn: '/auth/login',
  },

  secret: process.env.NEXTAUTH_SECRET,

  trustHost: true,

  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
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
          throw new Error('Too many login attempts. Please try again later.');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: String(email),
          },
        });

        if (!user) {
          throw new Error('No user found');
        }

        const passwordCorrect = await compare(
          (password as string) || '',
          user.hashedPassword
        );

        if (!passwordCorrect) {
          throw new Error('Password incorrect');
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hashedPassword, website, image, bio, deletedAt, ...userData } =
          user;

        if (user && passwordCorrect) {
          return {
            ...userData,
            website: website ?? undefined,
            image: image ?? undefined,
            bio: bio ?? undefined,
            deletedAt: deletedAt ?? undefined,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN';
        session.user.phone = token.phone as string;
        session.user.address = token.address as string;
        session.user.website = token.website as string;
        session.user.image = token.image as string;
        session.user.bio = token.bio as string;
        session.user.createdAt = token.createdAt as Date;
        session.user.updatedAt = token.updatedAt as Date;
        session.user.deletedAt = token.deletedAt as Date;
      }
      return session;
    },
  },
});
