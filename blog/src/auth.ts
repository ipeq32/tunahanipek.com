import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import { compare } from 'bcryptjs';
import { prisma } from './lib/prisma';

export const runtime = 'nodejs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 1 * 24 * 60 * 60, // 1 day
  },

  pages: {
    signIn: '/auth/login',
  },

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
        const { email, password } = credentials;

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

        if (user && passwordCorrect) {
          return {
            id: user.id,
            email: user.email,
          };
        }

        return null;
      },
    }),
  ],
});
