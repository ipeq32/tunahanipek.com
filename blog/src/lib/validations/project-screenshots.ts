import { z } from 'zod';

import { siteAuthCredentialsSchema } from '@/lib/validations/site-auth';

export const projectScreenshotRequestSchema = z.object({
  url: z.string().trim().url({ message: 'Invalid URL' }),
  proceedDespiteAuth: z.boolean().optional().default(false),
  authCredentials: siteAuthCredentialsSchema.optional(),
});

export type ProjectScreenshotRequestInput = z.infer<
  typeof projectScreenshotRequestSchema
>;
