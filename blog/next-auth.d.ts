// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
    website?: string | null;
    image?: string | null;
    bio?: string | null;
    role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    accessRoleId?: string;
    accessRoleSlug?: string;
    accessRoleName?: string;
    permissions?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    hasPassword?: boolean;
  }
}
