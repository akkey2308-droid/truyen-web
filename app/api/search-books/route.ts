import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) {
    return NextResponse.json([]);
  }

  const books = await prisma.book.findMany({
    where: {
      title: {
        contains: q,
      },
    },
    take: 6,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      cover: true,
    },
  });

  return NextResponse.json(books);
}