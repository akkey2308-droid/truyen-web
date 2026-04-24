"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function splitParagraphs(rawContent: string) {
  return rawContent
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function createChapter(bookId: number, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const chapterNumberValue = String(formData.get("chapterNumber") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!title) {
    throw new Error("Tên chương không được để trống.");
  }

  if (!chapterNumberValue) {
    throw new Error("Số chương không được để trống.");
  }

  const chapterNumber = Number(chapterNumberValue);

  

  if (!content) {
    throw new Error("Nội dung chương không được để trống.");
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    throw new Error("Không tìm thấy truyện.");
  }

  const existingChapter = await prisma.chapter.findFirst({
    where: {
      bookId,
      chapterNumber,
    },
  });

  if (existingChapter) {
    throw new Error("Số chương này đã tồn tại trong truyện.");
  }

  const paragraphs = splitParagraphs(content);

  if (paragraphs.length === 0) {
    throw new Error("Không thể tách nội dung thành đoạn hợp lệ.");
  }

  const chapter = await prisma.chapter.create({
    data: {
      bookId,
      title,
      chapterNumber,
    },
  });

  await prisma.chapterParagraph.createMany({
    data: paragraphs.map((paragraph, index) => ({
      chapterId: chapter.id,
      orderIndex: index + 1,
      content: paragraph,
    })),
  });

  redirect(`/admin/books/${bookId}`);
}