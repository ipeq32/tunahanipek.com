import { prisma } from '../../src/lib/prisma';
import { sanitizeHtml } from '../../src/lib/sanitize';
import { seedLanguagesIfEmpty } from './seed-languages';
import { blogSeeds } from './blog-data';
import type { BlogSeedEntry } from './blog-types';

const SEED_BLOG_CREATED_AT_START = new Date(Date.UTC(2025, 0, 1, 0, 0, 0));
const SEED_BLOG_CREATED_AT_STEP_DAYS = 7;

function getSeededBlogCreatedAt(index: number): Date {
  return new Date(
    SEED_BLOG_CREATED_AT_START.getTime() +
      index * SEED_BLOG_CREATED_AT_STEP_DAYS * 24 * 60 * 60 * 1000,
  );
}

async function connectTaxonomy(blogId: string, entry: BlogSeedEntry) {
  await prisma.blog.update({
    where: { id: blogId },
    data: {
      tags: {
        set: [],
        connectOrCreate: entry.tags.map((name) => ({
          where: { name: name.toLowerCase() },
          create: { name: name.toLowerCase() },
        })),
      },
      categories: {
        set: [],
        connectOrCreate: entry.categories.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
  });
}

export async function seedBlogs(authorId: string) {
  await seedLanguagesIfEmpty();

  const turkish = await prisma.language.findUnique({ where: { code: 'tr' } });
  const english = await prisma.language.findUnique({ where: { code: 'en' } });

  if (!turkish) {
    throw new Error('Turkish language seed is missing');
  }

  for (const [index, entry] of blogSeeds.entries()) {
    const createdAt = getSeededBlogCreatedAt(index);
    const existingTranslation = await prisma.blogTranslation.findFirst({
      where: {
        title: entry.title,
        languageId: turkish.id,
        blog: { deletedAt: null },
      },
      include: { blog: true },
    });

    const blog = existingTranslation
      ? await prisma.blog.update({
          where: { id: existingTranslation.blogId },
          data: {
            image: entry.image,
            shortImage: entry.shortImage,
            createdAt,
          },
        })
      : await prisma.blog.create({
          data: {
            image: entry.image,
            shortImage: entry.shortImage,
            author: { connect: { id: authorId } },
            createdAt,
          },
        });

    await prisma.blogTranslation.upsert({
      where: {
        blogId_languageId: {
          blogId: blog.id,
          languageId: turkish.id,
        },
      },
      create: {
        blogId: blog.id,
        languageId: turkish.id,
        title: entry.title,
        content: sanitizeHtml(entry.content),
        summary: sanitizeHtml(entry.summary),
        published: entry.published,
      },
      update: {
        title: entry.title,
        content: sanitizeHtml(entry.content),
        summary: sanitizeHtml(entry.summary),
        published: entry.published,
      },
    });

    if (english) {
      await prisma.blogTranslation.upsert({
        where: {
          blogId_languageId: {
            blogId: blog.id,
            languageId: english.id,
          },
        },
        create: {
          blogId: blog.id,
          languageId: english.id,
          title: `[EN] ${entry.title}`,
          content: sanitizeHtml(entry.content),
          summary: sanitizeHtml(entry.summary),
          published: false,
        },
        update: {},
      });
    }

    await connectTaxonomy(blog.id, entry);
  }
}
