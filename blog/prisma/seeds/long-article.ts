import type { BlogCoverKey } from './blog-covers';
import type { EducationalArticleDef, TutorialChapter } from './content-builder';

export type LongSection = {
  title: string;
  intro: string;
  paragraphs?: string[];
  steps?: string[];
  list?: { type: 'ul' | 'ol'; items: string[] };
  code?: string;
  code2?: string;
  tip?: string;
  warning?: string;
  blockquote?: string;
};

export type LongArticleInput = {
  title: string;
  coverKey: BlogCoverKey;
  category: string;
  tags: string[];
  stackNote: string;
  prerequisites: string[];
  objectives: string[];
  summaryIntro: string;
  summaryHook: string;
  sections: LongSection[];
  commonMistakes: string[];
  exercises: string[];
  nextSteps: string[];
};

function sectionToChapters(section: LongSection): TutorialChapter[] {
  const chapters: TutorialChapter[] = [
    {
      title: section.title,
      intro: section.intro,
      paragraphs: section.paragraphs,
      list: section.list,
      blockquote: section.blockquote,
      tip: section.tip,
      warning: section.warning,
      code: section.code,
    },
  ];

  if (section.steps?.length) {
    chapters.push({
      title: `${section.title} — Uygulama adımları`,
      intro:
        'Aşağıdaki adımları sırayla uygulayın. Her adım tamamlandığında bir sonrakine geçin; özellikle güvenlik ve veri bütünlüğü adımlarını atlamayın.',
      steps: section.steps,
      code: section.code2 ?? section.code,
      tip: section.tip,
    });
  } else if (section.code2) {
    chapters.push({
      title: `${section.title} — Ek örnek`,
      intro: 'İkinci örnek, edge case veya alternatif yaklaşımı gösterir.',
      code: section.code2,
    });
  }

  return chapters;
}

/** Uzun form öğretici makale — her bölüm detaylı paragraf + örnek kod */
export function createLongArticle(input: LongArticleInput): EducationalArticleDef {
  return {
    title: input.title,
    coverKey: input.coverKey,
    tags: input.tags,
    categories: [input.category],
    stackNote: input.stackNote,
    prerequisites: input.prerequisites,
    objectives: input.objectives,
    summaryIntro: input.summaryIntro,
    summaryHook: input.summaryHook,
    chapters: input.sections.flatMap(sectionToChapters),
    commonMistakes: input.commonMistakes,
    exercises: input.exercises,
    nextSteps: input.nextSteps,
  };
}

/** Ortak production paragrafları — makaleleri zenginleştirir */
export function productionNotes(topic: string): string[] {
  return [
    `Production ortamında <strong>${topic}</strong> ile ilgili en sık görülen sorun, geliştirme ortamındaki varsayımların (küçük veri seti, tek kullanıcı, sıcak cache) canlı trafikte çökmemesidir. Bu yüzden her değişiklikten önce yük testi veya en azından p95 latency ölçümü yapın.`,
    'Structured logging (request id, route, süre, kullanıcı id’si — PII olmadan) ve hata oranı alarmları, sorunları kullanıcı şikayetinden önce yakalamanızı sağlar. Log’da stack trace tutun; kullanıcıya generic mesaj gösterin.',
    'Dokümantasyonu kod ile birlikte güncelleyin: README, ADR (Architecture Decision Record) veya ekip wiki’sinde “neden bu kararı aldık?” sorusunun cevabı gelecekteki sizin en büyük yardımcınızdır.',
  ];
}
