import { z } from 'zod';
import { ALL_PERMISSIONS, type Permission } from '@/lib/auth/permissions';

const permissionValueSchema = z.enum(
  ALL_PERMISSIONS as [string, ...string[]]
);

const permissionsFieldSchema = z
  .array(permissionValueSchema)
  .min(1) as z.ZodType<Permission[]>;

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

export function createRoleFormSchema(messages: {
  nameMin: string;
  nameMax: string;
  slugMin: string;
  slugMax: string;
  slugInvalid: string;
  descriptionMax: string;
}) {
  return z.object({
    name: z.string().trim().min(2, messages.nameMin).max(64, messages.nameMax),
    slug: z
      .string()
      .trim()
      .min(2, messages.slugMin)
      .max(48, messages.slugMax)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, messages.slugInvalid),
    description: z
      .string()
      .trim()
      .max(240, messages.descriptionMax)
      .optional()
      .or(z.literal('')),
    permissions: permissionsFieldSchema,
  });
}

export function updateRoleFormSchema(messages: {
  nameMin: string;
  nameMax: string;
  descriptionMax: string;
}) {
  return z.object({
    name: z.string().trim().min(2, messages.nameMin).max(64, messages.nameMax),
    description: z
      .string()
      .trim()
      .max(240, messages.descriptionMax)
      .optional()
      .or(z.literal('')),
    permissions: permissionsFieldSchema,
  });
}

export type CreateRoleFormValues = z.infer<
  ReturnType<typeof createRoleFormSchema>
>;
export type UpdateRoleFormValues = z.infer<
  ReturnType<typeof updateRoleFormSchema>
>;
