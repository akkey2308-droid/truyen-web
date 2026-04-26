"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createChapterComment(
  chapterId: number,
  formData: FormData
) {
  const displayName = String(formData.get("displayName") || "").trim();
  const browserId = String(formData.get("browserId") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!displayName) throw new Error("Tên hiển thị không được để trống.");
  if (!browserId) throw new Error("Không xác định được trình duyệt.");
  if (!content) throw new Error("Nội dung bình luận không được để trống.");

  await prisma.chapterComment.create({
    data: {
      chapterId,
      displayName,
      browserId,
      content,
    },
  });

  redirect(`/chapter/${chapterId}`);
}

export async function deleteChapterComment(
  chapterId: number,
  commentId: number
) {
  await prisma.chapterComment.delete({
    where: { id: commentId },
  });

  redirect(`/chapter/${chapterId}`);
}