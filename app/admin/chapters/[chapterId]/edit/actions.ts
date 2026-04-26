"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

function splitParagraphs(content: string) {
  return content
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function similarity(a: string, b: string) {
  const left = normalizeText(a);
  const right = normalizeText(b);

  if (left === right) return 1;

  const max = Math.max(left.length, right.length);
  if (max === 0) return 1;

  let same = 0;
  const min = Math.min(left.length, right.length);

  for (let i = 0; i < min; i++) {
    if (left[i] === right[i]) same++;
  }

  return same / max;
}

async function deleteMediaFile(mediaPath: string) {
  if (!mediaPath.startsWith("/media/")) return;

  try {
    const fileName = path.basename(mediaPath);
    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

    await fs.unlink(path.join(uploadDir, fileName));
  } catch {}
}

function getImagePath(content: string) {
  const match = content.match(/^\[\[IMAGE:(\/media\/.+?)\]\]$/);
  return match?.[1] || null;
}

export async function updateChapter(chapterId: number, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const chapterNumberValue = String(formData.get("chapterNumber") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!title) throw new Error("Tên chương không được để trống.");

  const chapterNumber = Number(chapterNumberValue);

  if (!Number.isFinite(chapterNumber)) {
    throw new Error("Số chương không hợp lệ.");
  }

  if (!content) throw new Error("Nội dung chương không được để trống.");

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      book: true,
      paragraphs: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!chapter) throw new Error("Không tìm thấy chương.");

  const duplicatedChapter = await prisma.chapter.findFirst({
    where: {
      bookId: chapter.bookId,
      chapterNumber,
      NOT: { id: chapterId },
    },
  });

  if (duplicatedChapter) {
    throw new Error("Số chương này đã tồn tại trong truyện.");
  }

  const newParagraphs = splitParagraphs(content);
  const oldParagraphs = chapter.paragraphs;
  const usedOldIds = new Set<number>();

  await prisma.chapter.update({
    where: { id: chapterId },
    data: { title, chapterNumber },
  });

  // Đẩy orderIndex cũ sang số âm trước để tránh lỗi trùng orderIndex
  for (let i = 0; i < oldParagraphs.length; i++) {
    await prisma.chapterParagraph.update({
      where: { id: oldParagraphs[i].id },
      data: { orderIndex: -100000 - i },
    });
  }

  for (let index = 0; index < newParagraphs.length; index++) {
    const newContent = newParagraphs[index];

    let bestOld: (typeof oldParagraphs)[number] | null = null;
    let bestScore = 0;

    for (const oldParagraph of oldParagraphs) {
      if (usedOldIds.has(oldParagraph.id)) continue;

      const score = similarity(oldParagraph.content, newContent);

      if (score > bestScore) {
        bestScore = score;
        bestOld = oldParagraph;
      }
    }

    if (bestOld && bestScore >= 0.72) {
      const oldImage = getImagePath(bestOld.content);
      const newImage = getImagePath(newContent);

      if (oldImage && oldImage !== newImage) {
        await deleteMediaFile(oldImage);
      }

      usedOldIds.add(bestOld.id);

      await prisma.chapterParagraph.update({
        where: { id: bestOld.id },
        data: {
          orderIndex: index + 1,
          content: newContent,
        },
      });
    } else {
      await prisma.chapterParagraph.create({
        data: {
          chapterId,
          orderIndex: index + 1,
          content: newContent,
        },
      });
    }
  }

  for (const oldParagraph of oldParagraphs) {
    if (usedOldIds.has(oldParagraph.id)) continue;

    const imagePath = getImagePath(oldParagraph.content);

    if (imagePath) {
      await deleteMediaFile(imagePath);
    }

    await prisma.paragraphComment.deleteMany({
      where: { paragraphId: oldParagraph.id },
    });

    await prisma.chapterParagraph.delete({
      where: { id: oldParagraph.id },
    });
  }

  redirect(`/admin/books/${chapter.bookId}`);
}