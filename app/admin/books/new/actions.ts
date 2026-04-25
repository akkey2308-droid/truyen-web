"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function makeUniqueSlug(baseSlug: string) {
  let slug = baseSlug || `book-${Date.now()}`;
  let count = 1;

  while (await prisma.book.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}

export async function createBook(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const file = formData.get("cover") as File | null;

  if (!title) {
    throw new Error("Thiếu tên truyện.");
  }

  const slug = await makeUniqueSlug(slugify(rawSlug || title));

  let cover: string | null = null;

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${slug}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);
    cover = `/media/${fileName}`;
  }

  await prisma.book.create({
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

  redirect("/admin");
}