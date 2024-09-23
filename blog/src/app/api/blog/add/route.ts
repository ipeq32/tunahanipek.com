import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { content, image, shortImage, summary, title } = await req.json();

  try {
    const session = await auth();

    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await prisma?.blog.create({
      data: {
        title,
        image,
        shortImage,
        content,
        summary,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });

    revalidatePath('/');

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
