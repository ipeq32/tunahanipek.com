import { z } from 'zod';

export const siteSnippetTypeSchema = z.enum(['TIP', 'FOOTER_MOTTO']);

export const replaceSiteSnippetsSchema = z.object({
  type: siteSnippetTypeSchema,
  locale: z.string().min(2).max(5),
  items: z
    .array(
      z.object({
        content: z.string().trim().min(5).max(500),
        isActive: z.boolean().optional(),
      })
    )
    .min(1)
    .max(200),
});

export const siteSnippetAiRequestSchema = z.object({
  action: z.enum(['generate', 'translate', 'improve']),
  type: siteSnippetTypeSchema,
  locale: z.string().min(2).max(5),
  sourceLocale: z.string().min(2).max(5).optional(),
  count: z.number().int().min(1).max(10).optional(),
  topic: z.string().trim().max(200).optional(),
  lines: z.array(z.string().trim().min(1).max(500)).max(200).optional(),
  line: z.string().trim().min(1).max(500).optional(),
});
