import { prisma } from '@/lib/prisma';
import { IBlog } from '@/types/blog';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '9');
  const offset = (page - 1) * limit;

  try {
    const totalBlogs = await prisma.blog.count();

    const blogs: IBlog[] = await prisma.blog.findMany({
      skip: offset,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    if (!blogs) {
      return new Response('No blogs found', { status: 404 });
    }

    const data = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      blogs.map(async ({ authorId, deletedAt, ...rest }) => {
        const user = await prisma.user.findUnique({
          where: {
            id: authorId as string,
          },
          select: {
            name: true,
            image: true,
            role: true,
          },
        });

        if (!user) {
          return null;
        }

        return { ...rest, user };
      })
    );

    return NextResponse.json(
      { data, total: totalBlogs, page, limit },
      { status: 200 }
    );
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
