"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function deleteCoverFile(coverPath: string | null) {
  if (!coverPath || !coverPath.startsWith("/media/")) return;

  try {
    const fileName = path.basename(coverPath);
    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

    await fs.unlink(path.join(uploadDir, fileName));
  } catch {
    // bỏ qua nếu file không tồn tại
  }
}

export async function updateBook(bookId: number, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const removeCover = String(formData.get("removeCover") || "") === "on";
  const file = formData.get("cover") as File | null;

  if (!title) {
    throw new Error("Tên truyện không được để trống.");
  }

  const slug = normalizeSlug(slugInput || title);

  if (!slug) {
    throw new Error("Slug không hợp lệ.");
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    throw new Error("Không tìm thấy truyện.");
  }

  const duplicatedBook = await prisma.book.findFirst({
    where: {
      slug,
      NOT: { id: bookId },
    },
  });

  if (duplicatedBook) {
    throw new Error("Slug đã tồn tại.");
  }

  let cover = book.cover;

  if (removeCover) {
    await deleteCoverFile(book.cover);
    cover = null;
  }

  if (file && file.size > 0) {
    await deleteCoverFile(book.cover);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

    await fs.mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const fileName = `${Date.now()}-${safeSlug}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);
    cover = `/media/${fileName}`;
  }

  await prisma.book.update({
    where: { id: bookId },
    data: {
      title,
      slug,
      description: description || null,
      status: status || null,
      cover,
    },
  });

  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/admin");
  revalidatePath(`/book/${book.slug}`);
  revalidatePath(`/book/${slug}`);

  redirect(`/admin/books/${bookId}`);
}