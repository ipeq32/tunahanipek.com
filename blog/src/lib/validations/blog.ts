import { z } from 'zod';

const taxonomyInput = z
  .string()
  .max(500, 'Taxonomy input is too long')
  .optional();

export const createBlogSchema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(200),
  content: z.string().min(1, 'Content is required'),
  summary: z.string().trim().min(1, 'Summary is required').max(2000),
  image: z.string().trim().min(1, 'Image is required'),
  shortImage: z.string().trim().min(1, 'Short image is required'),
  tags: taxonomyInput,
  categories: taxonomyInput,
});

export const updateBlogSchema = z
  .object({
    title: z.string().trim().min(3, 'Title is too short').max(200),
    content: z.string().min(1, 'Content is required'),
    summary: z.string().trim().min(1, 'Summary is required').max(2000),
    image: z.string().trim().min(1, 'Image is required'),
    shortImage: z.string().trim().min(1, 'Short image is required'),
    published: z.boolean(),
    tags: taxonomyInput,
    categories: taxonomyInput,
  })
  .partial();

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
