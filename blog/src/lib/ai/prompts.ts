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
Preserve meaning, tone, and HTML structure. Do not add fabricated facts.

Input JSON:
${JSON.stringify(payload, null, 2)}

Respond with ONLY valid JSON matching the same keys. HTML fields must remain valid HTML using simple tags (p, h2, h3, ul, ol, li, strong, em, a, code, pre, blockquote).`;
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
- "content" / "description": well-structured HTML (p, h2, h3, ul, ol, li, strong, em, code)
- For blog: "content" should be a full article (multiple sections); "summary" a concise HTML excerpt
- For project: "description" should explain purpose, stack, and highlights based on the title/hints only

Respond with ONLY valid JSON: ${outputKeys}`;
}

export function buildTestPrompt(): string {
  return 'Reply with exactly: OK';
}
