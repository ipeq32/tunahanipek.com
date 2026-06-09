import { z } from 'zod';
import { optionalNullableUrlField, optionalUrlField } from './url-field';

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
  url: optionalNullableUrlField.optional(),
  image: optionalNullableUrlField.optional(),
  sortOrder: z.number().int().optional(),
  translations: z
    .array(translationSchema)
    .min(1, 'At least one translation is required'),
});

export const updateProjectSchema = z
  .object({
    url: optionalNullableUrlField.optional(),
    image: optionalNullableUrlField.optional(),
    sortOrder: z.number().int().optional(),
    published: z.boolean(),
    languageCode: z.string().trim().min(2).max(10),
    translations: z.array(translationUpdateSchema).optional(),
  })
  .partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
