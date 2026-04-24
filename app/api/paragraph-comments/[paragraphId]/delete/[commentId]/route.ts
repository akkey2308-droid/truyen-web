import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ paragraphId: string; commentId: string }>;
};

export async function DELETE(_: Request, { params }: Context) {
  const { paragraphId, commentId } = await params;
  const pid = Number(paragraphId);
  const cid = Number(commentId);

  if (!Number.isInteger(pid) || !Number.isInteger(cid)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const comment = await prisma.paragraphComment.findUnique({
    where: { id: cid },
  });

  if (!comment || comment.paragraphId !== pid) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  await prisma.paragraphComment.delete({
    where: { id: cid },
  });

  return NextResponse.json({ ok: true });
}