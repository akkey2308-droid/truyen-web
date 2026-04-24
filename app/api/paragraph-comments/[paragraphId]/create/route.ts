import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ paragraphId: string }>;
};

export async function POST(request: Request, { params }: Context) {
  const { paragraphId } = await params;
  const id = Number(paragraphId);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid paragraph id" }, { status: 400 });
  }

  const body = await request.json();
  const content = String(body.content || "").trim();

  if (!content) {
    return NextResponse.json(
      { error: "Nội dung comment không được để trống." },
      { status: 400 }
    );
  }

  const paragraph = await prisma.chapterParagraph.findUnique({
    where: { id },
  });

  if (!paragraph) {
    return NextResponse.json({ error: "Paragraph not found" }, { status: 404 });
  }

  const comment = await prisma.paragraphComment.create({
    data: {
      paragraphId: id,
      content,
    },
  });

  return NextResponse.json({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
  });
}