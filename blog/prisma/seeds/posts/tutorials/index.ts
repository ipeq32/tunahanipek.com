import { toEducationalEntry, unsplashImage } from '../../content-builder';
import type { BlogSeedEntry } from '../../blog-types';
import type { EducationalArticleDef } from '../../content-builder';
import { tutorialsPart1 } from './part-1';
import { tutorialsPart2 } from './part-2';
import { tutorialsPart3 } from './part-3';

const allTutorialDefs: EducationalArticleDef[] = [
  ...tutorialsPart1,
  ...tutorialsPart2,
  ...tutorialsPart3,
];

function toBlogSeedEntry(def: EducationalArticleDef): BlogSeedEntry {
  const entry = toEducationalEntry(def);
  return {
    title: def.title,
    image: unsplashImage(def.photoId),
    shortImage: unsplashImage(def.photoId, 600),
    tags: def.tags,
    categories: def.categories,
    published: true,
    summary: entry.summary,
    content: entry.content,
  };
}

export const tutorialBlogPosts: BlogSeedEntry[] = allTutorialDefs.map(toBlogSeedEntry);

export const TUTORIAL_COUNT = tutorialBlogPosts.length;
