"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

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

  if (coverPath && coverPath.startsWith("/uploads/")) {
    const fileName = coverPath.replace("/uploads/", "");
    const absolutePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      fileName
    );

    try {
      await fs.unlink(absolutePath);
    } catch {
      // Bỏ qua nếu file không tồn tại hoặc đã bị xóa trước đó
    }
  }

  redirect("/library");
}