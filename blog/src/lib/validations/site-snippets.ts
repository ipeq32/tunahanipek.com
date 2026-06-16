import { z } from 'zod';

export const SNIPPET_CONTENT_MIN = 5;
export const SNIPPET_CONTENT_MAX = 500;

export type SnippetContentMessages = {
  required: string;
  tooShort: string;
  tooLong: string;
};

export function siteSnippetContentSchema(messages: SnippetContentMessages) {
  return z
    .string()
    .trim()
    .min(1, messages.required)
    .min(SNIPPET_CONTENT_MIN, messages.tooShort)
    .max(SNIPPET_CONTENT_MAX, messages.tooLong);
}

export function createAddSiteCopyLineSchema(
  getRequiredMessage: (locale: string) => string,
  messages: Pick<SnippetContentMessages, 'tooShort' | 'tooLong'>
) {
  return z.object({
    tr: siteSnippetContentSchema({
      required: getRequiredMessage('TR'),
      tooShort: messages.tooShort,
      tooLong: messages.tooLong,
    }),
    en: siteSnippetContentSchema({
      required: getRequiredMessage('EN'),
      tooShort: messages.tooShort,
      tooLong: messages.tooLong,
    }),
    isActive: z.boolean(),
  });
}

export type AddSiteCopyLineFormValues = z.infer<
  ReturnType<typeof createAddSiteCopyLineSchema>
>;

export function validateSnippetContent(
  content: string,
  messages: SnippetContentMessages
): string | null {
  const trimmed = content.trim();
  if (!trimmed) {
    return null;
  }

  const result = siteSnippetContentSchema(messages).safeParse(trimmed);
  if (result.success) {
    return null;
  }

  return result.error.issues[0]?.message ?? messages.tooShort;
}

export function canSaveSnippetDrafts(
  drafts: Array<{ content: string }>,
  messages: SnippetContentMessages
): boolean {
  const hasValidItem = drafts.some(
    (draft) =>
      draft.content.trim().length > 0 &&
      validateSnippetContent(draft.content, messages) === null
  );

  if (!hasValidItem) {
    return false;
  }

  return !drafts.some(
    (draft) => validateSnippetContent(draft.content, messages) !== null
  );
}

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
