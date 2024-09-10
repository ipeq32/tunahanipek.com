import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const {
      email,
      password,
      passwordConfirm,
      name,
      phone,
      address,
      website,
      image,
      bio,
    } = await request.json();

    const user = await prisma?.user.findUnique({
      where: { email },
    });

    if (user) {
      return NextResponse.json(
        { message: 'User already exist' },
        { status: 409 }
      );
    }

    if (password !== passwordConfirm) {
      return NextResponse.json(
        { message: "Don't match passwords" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    await prisma?.user.create({
      data: {
        email,
        hashedPassword,
        name,
        phone,
        address,
        website,
        image,
        bio,
      },
    });

    return NextResponse.json({ message: 'success' });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.error();
  }
}
