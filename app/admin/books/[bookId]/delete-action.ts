"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function deleteBook(bookId: number) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    throw new Error("Không tìm thấy truyện để xóa.");
  }

  const coverPath = book.cover;

  await prisma.book.delete({
    where: { id: bookId },
  });

  if (coverPath && coverPath.startsWith("/media/")) {
    const fileName = coverPath.replace("/media/", "");

    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

    const absolutePath = path.join(uploadDir, fileName);

    try {
      await fs.unlink(absolutePath);
    } catch {
      // bỏ qua nếu file không tồn tại
    }
  }

  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/admin");

  redirect("/admin");
}