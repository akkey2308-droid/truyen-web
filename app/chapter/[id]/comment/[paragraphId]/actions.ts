"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createParagraphComment(
  chapterId: number,
  paragraphId: number,
  formData: FormData
) {
  const displayName = String(formData.get("displayName") || "").trim();
  const browserId = String(formData.get("browserId") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!displayName) {
    throw new Error("Tên hiển thị không được để trống.");
  }

  if (!browserId) {
    throw new Error("Không xác định được trình duyệt.");
  }

  if (!content) {
    throw new Error("Nội dung comment không được để trống.");
  }

  const paragraph = await prisma.chapterParagraph.findUnique({
    where: { id: paragraphId },
  });

  if (!paragraph) {
    throw new Error("Không tìm thấy đoạn văn.");
  }

  await prisma.paragraphComment.create({
    data: {
      paragraphId,
      displayName,
      browserId,
      content,
    },
  });

  redirect(`/chapter/${chapterId}/comment/${paragraphId}`);
}

export async function deleteComment(
  chapterId: number,
  paragraphId: number,
  commentId: number
) {
  await prisma.paragraphComment.delete({
    where: { id: commentId },
  });

  redirect(`/chapter/${chapterId}/comment/${paragraphId}`);
}