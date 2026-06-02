import type { BlogCoverKey } from './blog-covers';

export type ArticleSection = {
  heading: string;
  level?: 2 | 3;
  paragraphs: string[];
  list?: { type: 'ul' | 'ol'; items: string[] };
  blockquote?: string;
  code?: string;
  tip?: string;
  warning?: string;
};

export type TutorialChapter = {
  title: string;
  intro: string;
  paragraphs?: string[];
  steps?: string[];
  list?: { type: 'ul' | 'ol'; items: string[] };
  code?: string;
  tip?: string;
  warning?: string;
  blockquote?: string;
};

export type EducationalArticleDef = {
  title: string;
  coverKey: BlogCoverKey;
  tags: string[];
  categories: string[];
  stackNote: string;
  prerequisites: string[];
  objectives: string[];
  summaryIntro: string;
  summaryHook: string;
  chapters: TutorialChapter[];
  commonMistakes: string[];
  exercises: string[];
  nextSteps: string[];
};

export function buildSummary(intro: string, hook: string): string {
  return `<p>${intro}</p><p>${hook}</p>`;
}

function escapeCode(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderList(list: { type: 'ul' | 'ol'; items: string[] }): string {
  const items = list.items.map((item) => `<li>${item}</li>`).join('');
  return `<${list.type}>${items}</${list.type}>`;
}

function renderSectionExtras(section: {
  blockquote?: string;
  list?: { type: 'ul' | 'ol'; items: string[] };
  code?: string;
  tip?: string;
  warning?: string;
}): string {
  const parts: string[] = [];

  if (section.blockquote) {
    parts.push(`<blockquote>${section.blockquote}</blockquote>`);
  }
  if (section.list) {
    parts.push(renderList(section.list));
  }
  if (section.code) {
    parts.push(`<pre><code>${escapeCode(section.code)}</code></pre>`);
  }
  if (section.tip) {
    parts.push(
      `<p><strong>İpucu:</strong> ${section.tip}</p>`
    );
  }
  if (section.warning) {
    parts.push(
      `<p><strong>Dikkat:</strong> ${section.warning}</p>`
    );
  }

  return parts.join('\n');
}

export function buildContent(sections: ArticleSection[]): string {
  return sections
    .map((section) => {
      const tag = section.level === 3 ? 'h3' : 'h2';
      const parts: string[] = [`<${tag}>${section.heading}</${tag}>`];

      for (const paragraph of section.paragraphs) {
        parts.push(`<p>${paragraph}</p>`);
      }

      parts.push(renderSectionExtras(section));
      return parts.join('\n');
    })
    .join('\n\n');
}

export function buildEducationalContent(def: EducationalArticleDef): string {
  const introSections: ArticleSection[] = [
    {
      heading: 'Bu rehberde ne öğreneceksiniz?',
      paragraphs: [
        'Bu yazı bir haber özeti değil; adım adım uygulayabileceğiniz bir <strong>öğretici makale</strong> (tutorial) formatındadır. Her bölümün sonunda pratik çıkarımlar ve üretim ortamında karşılaşacağınız senaryolar yer alır.',
      ],
      list: { type: 'ul', items: def.objectives },
    },
    {
      heading: 'Ön koşullar',
      paragraphs: [
        'Rehberi verimli takip etmek için aşağıdaki bilgilere aşina olmanız önerilir. Eksik hissettiğiniz konularda ilgili bölümde ek kaynak ipuçları bulacaksınız.',
      ],
      list: { type: 'ul', items: def.prerequisites },
    },
    {
      heading: 'Güncellik ve teknoloji yığını',
      paragraphs: [
        `Makale <strong>2026</strong> itibarıyla güncellenmiştir. Örnekler ve API referansları şu yığınla uyumludur: <em>${def.stackNote}</em>. Eski sürüm dokümantasyonu ile karıştırmamak için major versiyon farklarını özellikle belirttik.`,
      ],
      blockquote:
        'Framework sürümleri hızla değişir; kalıcı olan prensipler (güvenlik, katman ayrımı, ölçüm) bu rehberin omurgasını oluşturur.',
    },
  ];

  const chapterSections: ArticleSection[] = def.chapters.flatMap((chapter) => {
    const sections: ArticleSection[] = [
      {
        heading: chapter.title,
        paragraphs: [
          chapter.intro,
          ...(chapter.paragraphs ?? []),
        ],
      },
    ];

    if (chapter.steps?.length) {
      sections.push({
        heading: 'Adım adım uygulama',
        level: 3,
        paragraphs: [
          'Aşağıdaki sırayı takip edin. Her adımı tamamlamadan bir sonrakine geçmeyin; özellikle güvenlik ve veri katmanı adımları atlanmamalıdır.',
        ],
        list: { type: 'ol', items: chapter.steps },
        code: chapter.code,
        tip: chapter.tip,
        warning: chapter.warning,
        blockquote: chapter.blockquote,
      });
    } else {
      const last = sections[sections.length - 1];
      last.list = chapter.list;
      last.code = chapter.code;
      last.tip = chapter.tip;
      last.warning = chapter.warning;
      last.blockquote = chapter.blockquote;
    }

    return sections;
  });

  const closingSections: ArticleSection[] = [
    {
      heading: 'Sık yapılan hatalar',
      paragraphs: [
        'Aşağıdaki tuzaklar eğitim ortamlarında nadiren, production\'da ise pahalıya mal olur. Code review checklist\'inize eklemenizi öneririz.',
      ],
      list: { type: 'ul', items: def.commonMistakes },
    },
    {
      heading: 'Pratik alıştırmalar',
      paragraphs: [
        'Okumak yeterli değildir; öğrenmeyi pekiştirmek için küçük bir side-project veya mevcut kod tabanınızda şu görevleri uygulayın:',
      ],
      list: { type: 'ol', items: def.exercises },
    },
    {
      heading: 'Özet ve sonraki adımlar',
      paragraphs: [
        'Bu rehberdeki prensipleri tek seferde tüm projeye uygulamaya çalışmayın. Önce tek bir route veya modül seçin, ölçün, sonra yaygınlaştırın.',
      ],
      list: { type: 'ul', items: def.nextSteps },
    },
  ];

  return buildContent([...introSections, ...chapterSections, ...closingSections]);
}

export function toEducationalEntry(def: EducationalArticleDef) {
  return {
    title: def.title,
    summary: buildSummary(def.summaryIntro, def.summaryHook),
    content: buildEducationalContent(def),
  };
}

export function unsplashImage(photoId: string, width = 1200): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&fit=crop&q=80`;
}

/** Unsplash photoId veya picsum:{seed} — her blog için benzersiz kapak URL */
export function blogCoverImage(source: string, width = 1200): string {
  if (source.startsWith('picsum:')) {
    const seed = source.slice('picsum:'.length);
    const height = Math.round(width * 0.525);
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
  }
  return unsplashImage(source, width);
}
