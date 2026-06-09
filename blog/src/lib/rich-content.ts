import { marked } from 'marked';
import { normalizeRichTextWhitespace } from './rich-text-whitespace';
import { sanitizeHtml } from './sanitize';

type RichField = 'content' | 'summary' | 'description';

type PrepareAiRichFieldOptions = {
  contentType: 'blog' | 'project';
  field: RichField;
};

marked.setOptions({
  gfm: true,
  breaks: false,
});

function isLikelyMarkdown(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^<[a-z][^>]*>/i.test(trimmed)) return false;

  return (
    /^#{1,6}\s/m.test(trimmed) ||
    /^\s*[-*+]\s/m.test(trimmed) ||
    /^\s*\d+\.\s/m.test(trimmed) ||
    /\*\*[^*]+\*\*/.test(trimmed) ||
    /`[^`]+`/.test(trimmed)
  );
}

function markdownToHtml(markdown: string): string {
  const parsed = marked.parse(markdown, { async: false });
  return typeof parsed === 'string' ? parsed : '';
}

function wrapPlainTextAsHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return '';

  return paragraphs.map((part) => `<p>${part}</p>`).join('');
}

/** Özet ve proje gövdesi: sayfa zaten h1/h2 kullandığı için iç başlıkları h3'e indirir. */
function demoteHeadingsForNestedContent(html: string): string {
  return html
    .replace(/<h1\b/gi, '<h3')
    .replace(/<\/h1>/gi, '</h3>')
    .replace(/<h2\b/gi, '<h3')
    .replace(/<\/h2>/gi, '</h3>');
}

/** Blog makalesi: sayfa h1'i vardır; içerikte yalnızca h1 → h2 düşürülür. */
function demoteBlogArticleHeadings(html: string): string {
  return html
    .replace(/<h1\b/gi, '<h2')
    .replace(/<\/h1>/gi, '</h2>');
}

function normalizeHeadings(
  html: string,
  options: PrepareAiRichFieldOptions,
): string {
  if (options.contentType === 'project' || options.field === 'summary') {
    return demoteHeadingsForNestedContent(html);
  }

  if (options.contentType === 'blog' && options.field === 'content') {
    return demoteBlogArticleHeadings(html);
  }

  return html;
}

/**
 * AI çıktısını (Markdown veya HTML) Quill + public sayfa ile uyumlu güvenli HTML'e çevirir.
 */
export function prepareAiRichField(
  value: string,
  options: PrepareAiRichFieldOptions,
): string {
  const trimmed = normalizeRichTextWhitespace(value).trim();
  if (!trimmed) return '';

  let html = trimmed;

  if (isLikelyMarkdown(trimmed)) {
    html = markdownToHtml(trimmed);
  } else if (!/<[a-z][^>]*>/i.test(trimmed)) {
    html = wrapPlainTextAsHtml(trimmed);
  }

  html = normalizeHeadings(html, options);

  return sanitizeHtml(html);
}

/** Veritabanından okunan ham içerik için aynı normalizasyon (blog + proje). */
export const normalizeStoredRichField = prepareAiRichField;
