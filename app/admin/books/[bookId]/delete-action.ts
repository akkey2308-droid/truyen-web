"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

async function deleteMediaFile(mediaPath: string | null) {
  if (!mediaPath || !mediaPath.startsWith("/media/")) return;

  try {
    const fileName = path.basename(mediaPath);
    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

    await fs.unlink(path.join(uploadDir, fileName));
  } catch {
    // bỏ qua nếu file không tồn tại
  }
}

export async function deleteBook(bookId: number) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      chapters: {
        include: {
          paragraphs: true,
        },
      },
    },
  });

  if (!book) {
    throw new Error("Không tìm thấy truyện để xóa.");
  }

  // Xóa cover
  await deleteMediaFile(book.cover);

  // Xóa toàn bộ ảnh trong các chương
  for (const chapter of book.chapters) {
    for (const paragraph of chapter.paragraphs) {
      const match = paragraph.content.match(/^\[\[IMAGE:(\/media\/.+?)\]\]$/);

      if (match) {
        await deleteMediaFile(match[1]);
      }
    }
  }

  await prisma.book.delete({
    where: { id: bookId },
  });

  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/admin");

  redirect("/admin");
}