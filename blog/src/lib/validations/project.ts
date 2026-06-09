import { z } from 'zod';

const translationSchema = z.object({
  languageCode: z.string().trim().min(2).max(10),
  title: z.string().trim().min(2).max(200),
  description: z.string().min(2).max(2000),
  published: z.boolean().optional(),
});

const translationUpdateSchema = translationSchema.partial({
  title: true,
  description: true,
});

export const createProjectSchema = z.object({
  url: z.string().url().optional().or(z.literal('')),
  image: z.string().url().optional().or(z.literal('')),
  sortOrder: z.number().int().optional(),
  translations: z
    .array(translationSchema)
    .min(1, 'At least one translation is required'),
});

export const updateProjectSchema = z
  .object({
    url: z.string().url().optional().nullable(),
    image: z.string().url().optional().nullable(),
    sortOrder: z.number().int().optional(),
    published: z.boolean(),
    languageCode: z.string().trim().min(2).max(10),
    translations: z.array(translationUpdateSchema).optional(),
  })
  .partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
