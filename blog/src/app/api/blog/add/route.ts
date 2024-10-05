import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { content, image, shortImage, summary, title } = await req.json();

  try {
    const session = await auth();

    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookies = req.headers.get('cookie');
    const localeMatch = cookies?.match(/NEXT_LOCALE=([^;]*)/);
    const locale = localeMatch ? localeMatch[1] : 'en';

    let slug = slugify(`${title}-${locale}`, { lower: true });
    let existingBlog = await prisma.blog.findUnique({ where: { slug } });
    let counter = 1;

    while (existingBlog) {
      slug = slugify(`${title}-${locale}-${counter}`, { lower: true });
      existingBlog = await prisma.blog.findUnique({ where: { slug } });
      counter++;
    }

    const res = await prisma?.blog.create({
      data: {
        title,
        image,
        shortImage,
        content,
        summary,
        slug,
        author: {
          connect: {
            id: user?.id,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: res }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }
}
