import type { SiteContext } from '@/lib/ai/site-context';
import { FIELD_LIMITS } from '@/lib/form/field-limits';

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

  return `You are a senior technical translator for a modern developer blog and portfolio.

Translate the following ${contentType} content from ${labels.source} to ${labels.target}.

Translation standards:
- Preserve the full depth, nuance, and professional tone of the source — never shorten, summarize, or flatten the text
- Adapt idioms and section headings naturally for ${labels.target} readers (e.g. Giriş ↔ Introduction, Teknoloji yığını ↔ Tech stack)
- Keep the same Markdown structure: same number of sections, headings, lists, and paragraphs
- Use fluent, publication-ready ${labels.target} suitable for senior engineers and technical decision-makers
- Do not add, remove, or invent facts, metrics, features, or claims

Input JSON:
${JSON.stringify(payload, null, 2)}

Respond with ONLY strictly valid JSON matching the same keys.
Rich text fields must use Markdown (not HTML): headings with ### or ##, bullet lists with -, emphasis with **bold** or *italic*, inline code with backticks.
Escape line breaks inside JSON strings as \\n (never raw newlines inside JSON string values).
Use regular ASCII spaces between words (never &nbsp; or Unicode non-breaking spaces).
Do not use HTML tags, div/span wrappers, inline styles, or h1.`;
}

function buildBlogExpandRequirements(lang: string): string {
  const isTurkish = lang === 'Turkish';

  const sectionLabels = isTurkish
    ? {
        intro: 'Giriş',
        conclusion: 'Sonuç',
      }
    : {
        intro: 'Introduction',
        conclusion: 'Conclusion',
      };

  return `For blog:
- "title": refine into a precise, professional headline — specific, credible, and compelling (not clickbait)
- "summary": exactly 2 substantive paragraphs (roughly 120–180 words total), no headings
  - Paragraph 1: hook the reader — context, problem, or motivation
  - Paragraph 2: what they will learn or gain; suitable for list cards and social previews
- "content": a complete, in-depth article (aim for 900–1,400 words unless the topic is genuinely narrow)
  - Use ## section headings only (never # / h1)
  - Required structure:
    1) ## ${sectionLabels.intro} — 2–3 paragraphs setting context, audience, and why the topic matters
    2) 3–5 ## main sections — each with 2–4 rich paragraphs exploring one angle in depth; use - bullet lists where they improve clarity
    3) ## ${sectionLabels.conclusion} — 1–2 paragraphs with concrete takeaways and a forward-looking closing thought
  - Writing quality:
    - Senior engineer voice: confident, precise, modern; explain the "why" behind decisions, not just the "what"
    - Each paragraph must carry real information — no filler, no generic AI phrasing (avoid "In today's world", "Let's dive in", "game-changer", "leverage" as empty buzzwords)
    - Use **bold** for key terms, *italic* for subtle emphasis, and \`inline code\` for technologies, APIs, or commands
    - Optional > blockquote for one memorable insight per article
    - Smooth transitions between sections; vary sentence rhythm
  - Stay faithful to the input — expand reasoning and structure, but do not invent version numbers, benchmarks, company names, or results not implied by the input`;
}

function buildProjectExpandRequirements(lang: string): string {
  const isTurkish = lang === 'Turkish';

  const sections = isTurkish
    ? [
        'Giriş',
        'Amaç ve kapsam',
        'Mimari ve yaklaşım',
        'Teknoloji yığını',
        'Öne çıkan özellikler',
        'Sonuç',
      ]
    : [
        'Introduction',
        'Purpose and scope',
        'Architecture and approach',
        'Tech stack',
        'Key features',
        'Conclusion',
      ];

  const sectionList = sections
    .map((name, index) => `${index + 1}) ### ${name}`)
    .join('\n  ');

  return `For project:
- "title": polish into a clear, professional project name
- "description": a detailed portfolio case study (aim for 500–800 words total) using exactly these ### sections in order:
  ${sectionList}
- Section guidelines:
  - ### ${sections[0]}: 2–3 paragraphs — project context, problem space, and high-level overview; make the reader understand what was built and for whom
  - ### ${sections[1]}: 2 paragraphs — goals, constraints, target users, and measurable intent (without inventing metrics)
  - ### ${sections[2]}: 2–3 paragraphs — design decisions, architectural patterns, trade-offs, and how components fit together
  - ### ${sections[3]}: flat bullet list (-) with 5–10 items; each item names a technology and briefly explains its role in the project
  - ### ${sections[4]}: flat bullet list (-) with 4–8 items; each item describes a capability with enough detail to show engineering depth (not one-word labels)
  - ### ${sections[5]}: 1–2 paragraphs — outcomes, lessons learned, and possible next steps grounded in the input
- Use ### headings only in project descriptions (never ## or #)
- Keep lists flat (single level); no tables, images, or fenced code blocks unless essential
- Write like a portfolio piece for senior engineers — polished, specific, and modern; avoid vague marketing copy
- Keep the full description under ${FIELD_LIMITS.project.description.max} characters (plain text, excluding HTML tags)`;
}

export function buildExpandPrompt(params: {
  contentType: 'blog' | 'project';
  language: string;
  fields: Record<string, string | undefined>;
  siteContext?: SiteContext | null;
}): string {
  const { contentType, language, fields, siteContext } = params;
  const lang = getLanguageLabel(language);

  const outputKeys =
    contentType === 'blog'
      ? '{ "title": string, "content": string, "summary": string }'
      : '{ "title": string, "description": string }';

  const typeRequirements =
    contentType === 'blog'
      ? buildBlogExpandRequirements(lang)
      : buildProjectExpandRequirements(lang);

  const siteContextBlock = siteContext
    ? `
Live website context (fetched from the project URL — use this to understand what the product does, its sections, and positioning; do not invent metrics or clients not supported by this data):
${JSON.stringify(
  {
    url: siteContext.url,
    pageTitle: siteContext.pageTitle,
    metaDescription: siteContext.metaDescription,
    headings: siteContext.headings,
    navPaths: siteContext.navPaths,
    sampledPages: siteContext.sampledPages,
  },
  null,
  2,
)}`
    : '';

  return `You are a senior technical writer and software architect crafting content for a modern developer blog and portfolio.

Write entirely in ${lang}. Your output must read like carefully edited, publication-ready prose — not a rough draft or generic AI summary.

Task: expand the input below into rich, professional content. Combine every provided field (title, summary/description, notes) as source material. Infer reasonable technical context from the topic and any website data, but never fabricate specific facts, metrics, company names, dates, or results not implied by the input.

Content type: ${contentType}
Input JSON:
${JSON.stringify(fields, null, 2)}${siteContextBlock}

Global rules:
- Rich text fields must use Markdown only (never HTML)
- Prioritize depth and clarity over brevity — every section should feel intentionally written
- Do not use HTML tags, tables, images, or h1 headings

${typeRequirements}

Respond with ONLY strictly valid JSON: ${outputKeys}
Escape line breaks inside JSON strings as \\n (never raw newlines inside JSON string values).
Use regular ASCII spaces between words (never &nbsp; or Unicode non-breaking spaces).`;
}

export function buildTestPrompt(): string {
  return 'Reply with exactly: OK';
}

export function buildSiteSnippetGeneratePrompt(params: {
  type: 'TIP' | 'FOOTER_MOTTO';
  locale: string;
  count: number;
  topic?: string;
  examples?: string[];
}): string {
  const lang = getLanguageLabel(params.locale);
  const kind =
    params.type === 'TIP'
      ? 'short "Did you know?" developer trivia facts'
      : 'witty, self-deprecating developer humor lines for a portfolio footer terminal';

  const examplesBlock = params.examples?.length
    ? `\nStyle reference (match tone and HTML patterns, do not copy verbatim):\n${params.examples
        .slice(0, 5)
        .map((line) => `- ${line}`)
        .join('\n')}`
    : '';

  const topicBlock = params.topic?.trim()
    ? `\nOptional theme: ${params.topic.trim()}`
    : '';

  return `You are a senior developer writing micro-copy for a modern developer blog.

Write exactly ${params.count} unique lines in ${lang} for: ${kind}.

Rules:
- Each line is ONE sentence or short quip (max ~180 characters)
- Use HTML entities for apostrophes: &apos; not '
- Wrap tech terms in <code>...</code> where natural (e.g. <code>git</code>, <code>null</code>)
- Tone: smart, playful, engineer-friendly — never corporate or generic AI filler
- For TIP: real or plausible dev facts, CS trivia, best practices
- For FOOTER_MOTTO: dry humor, deployment jokes, debugging pain, coffee, deadlines
- No markdown, no bullet prefixes, no numbering inside strings${topicBlock}${examplesBlock}

Respond with ONLY valid JSON: { "items": string[] }`;
}

export function buildSiteSnippetTranslatePrompt(params: {
  type: 'TIP' | 'FOOTER_MOTTO';
  sourceLanguage: string;
  targetLanguage: string;
  items: string[];
}): string {
  const source = getLanguageLabel(params.sourceLanguage);
  const target = getLanguageLabel(params.targetLanguage);

  return `You are a senior technical translator for a developer blog.

Translate these ${params.type === 'TIP' ? 'trivia tips' : 'footer humor lines'} from ${source} to ${target}.

Rules:
- Preserve HTML tags and structure (<code>, &apos;, etc.)
- Match the original tone: witty, engineer-friendly
- One output string per input line, same order
- Do not add or remove lines

Input JSON:
${JSON.stringify({ items: params.items }, null, 2)}

Respond with ONLY valid JSON: { "items": string[] }`;
}

export function buildSiteSnippetImprovePrompt(params: {
  type: 'TIP' | 'FOOTER_MOTTO';
  locale: string;
  line: string;
}): string {
  const lang = getLanguageLabel(params.locale);

  return `Improve this ${params.type === 'TIP' ? 'developer trivia line' : 'footer humor line'} in ${lang}.

Keep the same meaning but make it sharper, funnier, or more polished.
Preserve HTML tags (<code>, &apos;).

Input: ${JSON.stringify(params.line)}

Respond with ONLY valid JSON: { "item": string }`;
}
