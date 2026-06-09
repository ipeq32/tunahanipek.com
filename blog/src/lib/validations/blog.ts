import { z } from 'zod';

const taxonomyInput = z
  .string()
  .max(500, 'Taxonomy input is too long')
  .optional();

const translationSchema = z.object({
  languageCode: z.string().trim().min(2).max(10),
  title: z.string().trim().min(3, 'Title is too short').max(200),
  content: z.string().min(1, 'Content is required'),
  summary: z.string().trim().min(1, 'Summary is required').max(2000),
  published: z.boolean().optional(),
});

const translationUpdateSchema = translationSchema.partial({
  title: true,
  content: true,
  summary: true,
});

export const createBlogSchema = z.object({
  image: z.string().trim().min(1, 'Image is required'),
  shortImage: z.string().trim().min(1, 'Short image is required'),
  tags: taxonomyInput,
  categories: taxonomyInput,
  translations: z.array(translationSchema).min(1, 'At least one translation is required'),
});

export const updateBlogSchema = z
  .object({
    image: z.string().trim().min(1, 'Image is required'),
    shortImage: z.string().trim().min(1, 'Short image is required'),
    published: z.boolean(),
    languageCode: z.string().trim().min(2).max(10),
    tags: taxonomyInput,
    categories: taxonomyInput,
    translations: z.array(translationUpdateSchema).optional(),
  })
  .partial();

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
