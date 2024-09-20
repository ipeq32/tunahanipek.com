import { prisma } from '@/lib/prisma';
import { IBlog } from '@/types/blog';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const blogs: IBlog[] = await prisma.blog.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    if (!blogs) {
      return new Response('No blogs found', { status: 404 });
    }

    const data = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      blogs.map(async ({ userId, deletedAt, ...rest }) => {
        const user = await prisma.user.findUnique({
          where: {
            id: userId as string,
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

    return NextResponse.json({ data }, { status: 200 });
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
