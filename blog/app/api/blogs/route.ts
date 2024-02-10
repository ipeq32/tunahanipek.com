
import { prisma } from "@libs/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const blogs = await prisma.blog.findMany({
    include: {
      user: true,
      tags: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(blogs);
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    const blog = await prisma.blog.create({
      data: json,
    });

    return new NextResponse(JSON.stringify(blog), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return new NextResponse("User with email already exists", {
        status: 409,
      });
    }

    return new NextResponse(error.message, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const json = await request.json();

    const blog = await prisma.blog.update({
      where: {
        id: json.id,
      },
      data: json,
    });

    return new NextResponse(JSON.stringify(blog), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const json = await request.json();

    await prisma.blog.delete({
      where: {
        id: json.id,
      },
    });

    return new NextResponse(null, {
      status: 204,
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}