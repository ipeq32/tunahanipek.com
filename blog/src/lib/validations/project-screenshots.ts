import { z } from 'zod';

export const projectScreenshotRequestSchema = z.object({
  url: z.string().trim().url({ message: 'Invalid URL' }),
  proceedDespiteAuth: z.boolean().optional().default(false),
});

export type ProjectScreenshotRequestInput = z.infer<
  typeof projectScreenshotRequestSchema
>;
