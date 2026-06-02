import { prisma } from '../../src/lib/prisma';
import { sanitizeHtml } from '../../src/lib/sanitize';
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
  for (const entry of blogSeeds) {
    const existing = await prisma.blog.findFirst({
      where: { title: entry.title, deletedAt: null },
    });

    const payload = {
      title: entry.title,
      image: entry.image,
      shortImage: entry.shortImage,
      content: sanitizeHtml(entry.content),
      summary: sanitizeHtml(entry.summary),
      published: entry.published,
    };

    const blog = existing
      ? await prisma.blog.update({
          where: { id: existing.id },
          data: payload,
        })
      : await prisma.blog.create({
          data: {
            ...payload,
            author: { connect: { id: authorId } },
          },
        });

    await connectTaxonomy(blog.id, entry);
  }
}
