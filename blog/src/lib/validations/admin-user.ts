import { z } from 'zod';

export const updateAdminUserAccessRoleSchema = z.object({
  accessRoleId: z.string().uuid(),
});
