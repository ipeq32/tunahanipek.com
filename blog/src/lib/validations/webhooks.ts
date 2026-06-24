import { z } from 'zod';

import { WEBHOOK_SLUG_PATTERN } from '@/lib/webhooks/constants';

export const createWebhookSourceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(48)
    .regex(WEBHOOK_SLUG_PATTERN, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().trim().max(240).optional(),
  provider: z.enum(['GENERIC', 'COOLIFY']).default('GENERIC'),
  enabled: z.boolean().default(true),
});

export const updateWebhookSourceSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(240).nullable().optional(),
  provider: z.enum(['GENERIC', 'COOLIFY']).optional(),
  enabled: z.boolean().optional(),
});

export const listWebhookEventsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sourceId: z.string().uuid().optional(),
  severity: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).optional(),
  status: z.enum(['NEW', 'READ', 'ARCHIVED']).optional(),
  search: z.string().trim().max(120).optional(),
});

export const updateWebhookEventSchema = z.object({
  status: z.enum(['NEW', 'READ', 'ARCHIVED']),
});
