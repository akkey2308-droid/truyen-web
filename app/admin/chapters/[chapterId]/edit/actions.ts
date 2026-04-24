"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function splitParagraphs(content: string) {
  return content
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function updateChapter(chapterId: number, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const chapterNumberValue = String(formData.get("chapterNumber") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!title) {
    throw new Error("Tên chương không được để trống.");
  }

  const chapterNumber = Number(chapterNumberValue);

  

  if (!content) {
    throw new Error("Nội dung chương không được để trống.");
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      book: true,
    },
  });

  if (!chapter) {
    throw new Error("Không tìm thấy chương.");
  }

  const duplicatedChapter = await prisma.chapter.findFirst({
    where: {
      bookId: chapter.bookId,
      chapterNumber,
      NOT: {
        id: chapterId,
      },
    },
  });

  if (duplicatedChapter) {
    throw new Error("Số chương này đã tồn tại trong truyện.");
  }

  const paragraphs = splitParagraphs(content);

  if (paragraphs.length === 0) {
    throw new Error("Không thể tách nội dung thành paragraph hợp lệ.");
  }

  await prisma.chapter.update({
    where: { id: chapterId },
    data: {
      title,
      chapterNumber,
    },
  });

  await prisma.chapterParagraph.deleteMany({
    where: {
      chapterId,
    },
  });

  await prisma.chapterParagraph.createMany({
    data: paragraphs.map((paragraph, index) => ({
      chapterId,
      orderIndex: index + 1,
      content: paragraph,
    })),
  });

  redirect(`/admin/books/${chapter.bookId}`);
}