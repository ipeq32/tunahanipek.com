type LanguageLabel = { source: string; target: string };

const LANGUAGE_NAMES: Record<string, string> = {
  tr: 'Turkish',
  en: 'English',
};

export function getLanguageLabel(code: string): string {
  return LANGUAGE_NAMES[code] ?? code;
}

export function buildTranslatePrompt(params: {
  contentType: 'blog' | 'project';
  sourceLanguage: string;
  targetLanguage: string;
  fields: Record<string, string | undefined>;
}): string {
  const { contentType, sourceLanguage, targetLanguage, fields } = params;
  const labels: LanguageLabel = {
    source: getLanguageLabel(sourceLanguage),
    target: getLanguageLabel(targetLanguage),
  };

  const fieldList =
    contentType === 'blog'
      ? ['title', 'content', 'summary']
      : ['title', 'description'];

  const payload = Object.fromEntries(
    fieldList
      .filter((key) => fields[key]?.trim())
      .map((key) => [key, fields[key]]),
  );

  return `You are a professional translator for a modern technical blog and portfolio website.

Translate the following ${contentType} content from ${labels.source} to ${labels.target}.
Preserve meaning, tone, and Markdown structure. Do not add fabricated facts.

Input JSON:
${JSON.stringify(payload, null, 2)}

Respond with ONLY strictly valid JSON matching the same keys.
Rich text fields must use Markdown (not HTML): headings with ### or ##, bullet lists with -, emphasis with **bold** or *italic*, inline code with backticks.
Escape line breaks inside JSON strings as \\n (never raw newlines inside JSON string values).
Use regular ASCII spaces between words (never &nbsp; or Unicode non-breaking spaces).
Do not use HTML tags, div/span wrappers, inline styles, or h1.`;
}

export function buildExpandPrompt(params: {
  contentType: 'blog' | 'project';
  language: string;
  fields: Record<string, string | undefined>;
}): string {
  const { contentType, language, fields } = params;
  const lang = getLanguageLabel(language);

  const outputKeys =
    contentType === 'blog'
      ? '{ "title": string, "content": string, "summary": string }'
      : '{ "title": string, "description": string }';

  return `You are a senior technical writer for a modern professional blog and portfolio.

Write in ${lang}. Use a clear, professional, engaging tone suitable for a developer portfolio.
Expand the short input into polished content. Do not invent specific facts, metrics, or claims not implied by the input.

Content type: ${contentType}
Input JSON:
${JSON.stringify(fields, null, 2)}

Requirements:
- Rich text fields must use Markdown only (never HTML)
- For blog:
  - "content" = full article with ## section headings (never # / h1). Use clear sections such as Giriş/Introduction, main topic sections, and Sonuç/Conclusion when appropriate
  - "summary" = 1-2 short paragraphs, no headings, suitable for list cards
- For project: "description" must use exactly these ### sections in order:
  1) Giriş (or Introduction in English)
  2) Amaç (or Purpose)
  3) Teknoloji yığını (or Tech stack) as a bullet list
  4) Öne çıkan özellikler (or Key features) as a bullet list
- Use ### headings only in project descriptions (never ## or #)
- Keep lists flat (single level), no tables, images, or code blocks unless essential

Respond with ONLY strictly valid JSON: ${outputKeys}
Escape line breaks inside JSON strings as \\n (never raw newlines inside JSON string values).
Use regular ASCII spaces between words (never &nbsp; or Unicode non-breaking spaces).`;
}

export function buildTestPrompt(): string {
  return 'Reply with exactly: OK';
}
