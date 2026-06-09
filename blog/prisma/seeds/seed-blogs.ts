import { prisma } from '../../src/lib/prisma';
import { sanitizeHtml } from '../../src/lib/sanitize';
import { seedLanguagesIfEmpty } from './seed-languages';
import { blogSeeds } from './blog-data';
import type { BlogSeedEntry } from './blog-types';

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

  for (const entry of blogSeeds) {
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
          },
        })
      : await prisma.blog.create({
          data: {
            image: entry.image,
            shortImage: entry.shortImage,
            author: { connect: { id: authorId } },
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
