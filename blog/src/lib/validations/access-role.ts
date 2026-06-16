import { z } from 'zod';
import { ALL_PERMISSIONS } from '@/lib/auth/permissions';

const permissionValueSchema = z.enum(
  ALL_PERMISSIONS as [string, ...string[]]
);

export const createAccessRoleSchema = z.object({
  name: z.string().trim().min(2).max(64),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  description: z.string().trim().max(240).optional(),
  permissions: z.array(permissionValueSchema).min(1),
});

export const updateAccessRoleSchema = z.object({
  name: z.string().trim().min(2).max(64).optional(),
  description: z.string().trim().max(240).nullable().optional(),
  permissions: z.array(permissionValueSchema).min(1).optional(),
});

export const updateAdminUserAccessRoleSchema = z.object({
  accessRoleId: z.string().uuid(),
});
