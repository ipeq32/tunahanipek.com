import type { Role } from '@prisma/client';

export type AdminUserDto = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  createdAt: string;
  hasPassword: boolean;
  oauthProviders: string[];
  blogCount: number;
  commentCount: number;
  emailVerified: boolean;
};

export type AdminUserMutationErrorCode =
  | 'SELF_ROLE_CHANGE_FORBIDDEN'
  | 'LAST_SUPER_ADMIN_FORBIDDEN'
  | 'SELF_DELETE_FORBIDDEN'
  | 'USER_NOT_FOUND'
  | 'USER_MANAGEMENT_FORBIDDEN';
