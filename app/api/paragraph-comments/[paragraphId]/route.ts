import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ paragraphId: string }>;
};

export async function GET(_: Request, { params }: Context) {
  const { paragraphId } = await params;
  const id = Number(paragraphId);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid paragraph id" }, { status: 400 });
  }

  const paragraph = await prisma.chapterParagraph.findUnique({
    where: { id },
    include: {
      comments: {
        orderBy: {
          createdAt: "desc",
        },
      },
      chapter: {
        include: {
          book: true,
        },
      },
    },
  });

  if (!paragraph) {
    return NextResponse.json({ error: "Paragraph not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: paragraph.id,
    content: paragraph.content,
    chapterId: paragraph.chapterId,
    chapterTitle: paragraph.chapter.title,
    bookTitle: paragraph.chapter.book.title,
    comments: paragraph.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
    })),
  });
}