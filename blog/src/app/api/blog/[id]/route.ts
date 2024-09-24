import { prisma } from '@/lib/prisma';
import { IBlog } from '@/types/blog';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Params = {
  id: string;
};

export async function GET(request: Request, context: { params: Params }) {
  const id = context.params.id;
  try {
    const blog: IBlog | null = await prisma.blog.findUnique({
      where: {
        id,
        deletedAt: null,
        published: true,
      },
    });

    if (!blog) {
      return new Response('No blog found', { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authorId, deletedAt, ...rest } = blog;

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

    const data = {
      ...rest,
      user,
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message + 'asdaddsada' },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }
}
