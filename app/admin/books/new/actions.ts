"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

export async function createBook(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const status = String(formData.get("status") || "").trim();

  const file = formData.get("cover") as File | null;

  if (!title || !slug) {
    throw new Error("Thiếu tên truyện hoặc slug.");
  }

  let cover: string | null = null;

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const fileName = `${Date.now()}-${safeSlug}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);
    cover = `/uploads/${fileName}`;
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