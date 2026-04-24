"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function deleteChapter(chapterId: number) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      book: true,
    },
  });

  if (!chapter) {
    throw new Error("Không tìm thấy chương để xóa.");
  }

  await prisma.chapter.delete({
    where: { id: chapterId },
  });

  redirect(`/book/${chapter.book.slug}`);
}