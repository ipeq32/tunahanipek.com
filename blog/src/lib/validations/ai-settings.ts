import { z } from 'zod';

import { siteAuthCredentialsSchema } from '@/lib/validations/site-auth';

export const aiProviderSchema = z.enum(['gemini', 'groq', 'ollama']);

export const upsertAiSettingsSchema = z.object({
  enabled: z.boolean(),
  provider: aiProviderSchema,
  geminiApiKey: z.string().optional(),
  groqApiKey: z.string().optional(),
  geminiModel: z.string().trim().min(1).max(120),
  groqModel: z.string().trim().min(1).max(120),
  ollamaBaseUrl: z.string().trim().url().or(z.literal('http://localhost:11434')),
  ollamaModel: z.string().trim().min(1).max(120),
  autoTranslateOnSave: z.boolean(),
});

export const testAiSettingsSchema = upsertAiSettingsSchema;

export const aiContentRequestSchema = z.object({
  action: z.enum(['translate', 'expand']),
  contentType: z.enum(['blog', 'project']),
  sourceLanguage: z.string().trim().min(2).max(10),
  targetLanguage: z.string().trim().min(2).max(10).optional(),
  fields: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    summary: z.string().optional(),
    description: z.string().optional(),
  }),
  projectUrl: z.string().trim().optional(),
  authCredentials: siteAuthCredentialsSchema.optional(),
});

export type UpsertAiSettingsInput = z.infer<typeof upsertAiSettingsSchema>;
export type AiContentRequestInput = z.infer<typeof aiContentRequestSchema>;
