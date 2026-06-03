import sanitizeHtmlLib, { type IOptions } from 'sanitize-html';

/**
 * Zengin metin (blog içeriği, özet, yorumlar) için izin verilen güvenli HTML.
 * Sunucu tarafında çalışır; jsdom gibi ağır bağımlılıklara ihtiyaç duymaz.
 */
const SANITIZE_OPTIONS: IOptions = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'br',
    'hr',
    'blockquote',
    'pre',
    'code',
    'span',
    'div',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'sub',
    'sup',
    'mark',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(left|right|center|justify)$/],
      color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  transformTags: {
    a: (tagName, attribs) => {
      const rawHref = (attribs.href ?? '').trim();
      // Protokolsüz girilen bağlantılar (ör. "example.com") tarayıcıda göreli
      // yol sayılıp kırıldığı için eksik şemayı tamamlarız.
      const hasKnownScheme = /^(https?:|mailto:|tel:|\/|#|\?)/i.test(rawHref);
      const href = rawHref && !hasKnownScheme ? `https://${rawHref}` : rawHref;
      const isExternal = /^https?:\/\//i.test(href);

      return {
        tagName: 'a',
        attribs: {
          ...attribs,
          ...(href ? { href } : {}),
          rel: 'noopener noreferrer',
          // Dış bağlantılar yeni sekmede açılır; iç/mailto/tel aynı sekmede.
          ...(isExternal ? { target: '_blank' } : {}),
        },
      };
    },
  },
};

export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, SANITIZE_OPTIONS);
}
