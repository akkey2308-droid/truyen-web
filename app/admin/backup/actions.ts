"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import AdmZip from "adm-zip";
import fs from "fs/promises";
import path from "path";

function toDate(value: string | Date) {
  return new Date(value);
}

export async function restoreBackup(formData: FormData) {
  const file = formData.get("backup") as File | null;

  if (!file || file.size === 0) {
    throw new Error("Chưa chọn file backup.");
  }

  const bytes = await file.arrayBuffer();
  const zip = new AdmZip(Buffer.from(bytes));

  const backupEntry = zip.getEntry("backup.json");

  if (!backupEntry) {
    throw new Error("File backup không hợp lệ.");
  }

  const data = JSON.parse(backupEntry.getData().toString("utf-8"));

  await prisma.paragraphComment.deleteMany();
  await prisma.chapterParagraph.deleteMany();
  await prisma.readingProgress.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.book.deleteMany();

  await prisma.book.createMany({
    data: data.books.map((book: any) => ({
      id: book.id,
      title: book.title,
      slug: book.slug,
      cover: book.cover,
      description: book.description,
      status: book.status,
      createdAt: toDate(book.createdAt),
      
    })),
  });

  await prisma.chapter.createMany({
    data: data.chapters.map((chapter: any) => ({
      id: chapter.id,
      bookId: chapter.bookId,
      title: chapter.title,
      chapterNumber: chapter.chapterNumber,
      createdAt: toDate(chapter.createdAt),
      updatedAt: toDate(chapter.updatedAt),
    })),
  });

  await prisma.chapterParagraph.createMany({
    data: data.paragraphs.map((paragraph: any) => ({
      id: paragraph.id,
      chapterId: paragraph.chapterId,
      orderIndex: paragraph.orderIndex,
      content: paragraph.content,
      
    })),
  });

  await prisma.paragraphComment.createMany({
    data: data.comments.map((comment: any) => ({
      id: comment.id,
      paragraphId: comment.paragraphId,
      content: comment.content,
      displayName: comment.displayName,
      browserId: comment.browserId,
      createdAt: toDate(comment.createdAt),
      updatedAt: toDate(comment.updatedAt),
    })),
  });

  await prisma.readingProgress.createMany({
    data: data.progress.map((item: any) => ({
      id: item.id,
      bookId: item.bookId,
      chapterId: item.chapterId,
      scrollPosition: item.scrollPosition,
      browserId: item.browserId,
      updatedAt: toDate(item.updatedAt),
    })),
  });

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.rm(uploadsDir, { recursive: true, force: true });
  await fs.mkdir(uploadsDir, { recursive: true });

  const uploadEntries = zip
    .getEntries()
    .filter((entry) => entry.entryName.startsWith("uploads/") && !entry.isDirectory);

  for (const entry of uploadEntries) {
    const fileName = path.basename(entry.entryName);
    await fs.writeFile(path.join(uploadsDir, fileName), entry.getData());
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/library");

  redirect("/admin");
}