import { prisma } from "@libs/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const blog = await prisma.blog.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      tags: true,
    },
  });

  if (!blog) {
    return new NextResponse("No blog with ID found", { status: 404 });
  }

  return NextResponse.json(blog);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  let json = await request.json();

  const updated_blog = await prisma.blog.update({
    where: { id },
    data: json,
  });

  if (!updated_blog) {
    return new NextResponse("No blog with ID found", { status: 404 });
  }

  return NextResponse.json(updated_blog);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await prisma.blog.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.code === "P2025") {
      return new NextResponse("No blog with ID found", { status: 404 });
    }

    return new NextResponse(error.message, { status: 500 });
  }
}
