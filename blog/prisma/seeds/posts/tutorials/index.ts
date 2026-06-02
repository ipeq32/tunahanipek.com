import { resolveCoverSource } from '../../blog-covers';
import { blogCoverImage, toEducationalEntry } from '../../content-builder';
import type { BlogSeedEntry } from '../../blog-types';
import type { EducationalArticleDef } from '../../content-builder';
import { finalizeArticles } from '../../article-expansion';
import { CATEGORY_PLAN, EXPECTED_TUTORIAL_COUNT } from '../../category-plan';
import { tutorialsPart1 } from './part-1';
import { tutorialsPart2 } from './part-2';
import { tutorialsPart3 } from './part-3';
import { tutorialsPart4 } from './part-4';

const allTutorialDefs: EducationalArticleDef[] = finalizeArticles([
  ...tutorialsPart1,
  ...tutorialsPart2,
  ...tutorialsPart3,
  ...tutorialsPart4,
]).filter((def) => def.coverKey !== 'ai');

function assertCategoryDistribution(defs: EducationalArticleDef[]) {
  const counts = new Map<string, number>();
  for (const def of defs) {
    const cat = def.categories[0];
    if (!cat) continue;
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }
  for (const [category, expected] of Object.entries(CATEGORY_PLAN)) {
    const actual = counts.get(category) ?? 0;
    if (actual < 2 || actual > 5) {
      throw new Error(
        `Kategori "${category}": ${actual} makale (beklenen 2–5, plan ${expected})`
      );
    }
  }
  if (defs.length !== EXPECTED_TUTORIAL_COUNT) {
    throw new Error(
      `Toplam makale: ${defs.length}, beklenen: ${EXPECTED_TUTORIAL_COUNT}`
    );
  }
}

assertCategoryDistribution(allTutorialDefs);

function toBlogSeedEntry(def: EducationalArticleDef): BlogSeedEntry {
  const entry = toEducationalEntry(def);
  const cover = resolveCoverSource(def.coverKey);
  return {
    title: def.title,
    image: blogCoverImage(cover),
    shortImage: blogCoverImage(cover, 600),
    tags: def.tags,
    categories: def.categories,
    published: true,
    summary: entry.summary,
    content: entry.content,
  };
}

export const tutorialBlogPosts: BlogSeedEntry[] = allTutorialDefs.map(toBlogSeedEntry);

export const TUTORIAL_COUNT = tutorialBlogPosts.length;
