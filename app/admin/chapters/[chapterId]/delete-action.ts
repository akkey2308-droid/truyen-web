"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteChapter(chapterId: number) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      book: true,
    },
  });

  if (!chapter) {
    throw new Error("Không tìm thấy chương.");
  }

  await prisma.chapter.delete({
    where: { id: chapterId },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/books/${chapter.bookId}`);
  revalidatePath(`/book/${chapter.book.slug}`);

  redirect(`/admin/books/${chapter.bookId}`);
}