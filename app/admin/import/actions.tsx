"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import EPub from "epub2";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function makeUniqueSlug(baseSlug: string) {
  let slug = baseSlug || `book-${Date.now()}`;
  let count = 1;

  while (true) {
    const existed = await prisma.book.findUnique({
      where: { slug },
    });

    if (!existed) return slug;

    slug = `${baseSlug}-${count}`;
    count++;
  }
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitParagraphs(content: string) {
  return content
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

async function parseEpub(epubPath: string) {
  const epub = new EPub(epubPath) as any;

  await new Promise<void>((resolve, reject) => {
    epub.on("end", () => resolve());
    epub.on("error", (err: unknown) => reject(err));
    epub.parse();
  });

  return epub;
}

export async function importEpub(formData: FormData) {
  const file = formData.get("epub") as File | null;

  if (!file || file.size === 0) {
    throw new Error("Chưa chọn file EPUB.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const tempDir = path.join(process.cwd(), "temp");
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await fs.mkdir(tempDir, { recursive: true });
  await fs.mkdir(uploadDir, { recursive: true });

  const tempFilePath = path.join(tempDir, `${Date.now()}-${file.name}`);
  await fs.writeFile(tempFilePath, buffer);

  const epub = await parseEpub(tempFilePath);

  const title = String(epub.metadata?.title || "Untitled").trim();
  const description = String(epub.metadata?.description || "").trim() || null;
  const slug = await makeUniqueSlug(slugify(title));

  let cover: string | null = null;

  try {
    if (epub.cover) {
      cover = await new Promise<string | null>((resolve) => {
        epub.getImage(
          epub.cover,
          async (err: unknown, data: Buffer, mimeType: string) => {
            if (err || !data) {
              resolve(null);
              return;
            }

            const ext =
              mimeType === "image/png"
                ? "png"
                : mimeType === "image/webp"
                ? "webp"
                : "jpg";

            const fileName = `${Date.now()}-${slug}-cover.${ext}`;
            const filePath = path.join(uploadDir, fileName);

            await fs.writeFile(filePath, data);
            resolve(`/uploads/${fileName}`);
          }
        );
      });
    }
  } catch {
    cover = null;
  }

  const flowItems = Array.isArray(epub.flow)
    ? epub.flow.filter((item: any) => item && item.id)
    : [];

  if (flowItems.length === 0) {
    throw new Error("EPUB không có chapter hợp lệ để import.");
  }

  const book = await prisma.book.create({
    data: {
      title,
      slug,
      description,
      cover,
      status: "Đang cập nhật",
    },
  });

  let chapterNumber = 1;

  for (const item of flowItems) {
    const chapterHtml = await new Promise<string>((resolve) => {
      epub.getChapter(item.id, (err: unknown, text: string) => {
        if (err) {
          resolve("");
          return;
        }

        resolve(text || "");
      });
    });

    const content = stripHtml(chapterHtml);
    if (!content) continue;

    const chapterTitle =
      String(item.title || "").trim() || `Chương ${chapterNumber}`;

    const chapter = await prisma.chapter.create({
      data: {
        bookId: book.id,
        chapterNumber,
        title: chapterTitle,
      },
    });

    const paragraphs = splitParagraphs(content);

    if (paragraphs.length > 0) {
      await prisma.chapterParagraph.createMany({
        data: paragraphs.map((paragraph, index) => ({
          chapterId: chapter.id,
          orderIndex: index + 1,
          content: paragraph,
        })),
      });
    }

    chapterNumber++;
  }

  await fs.unlink(tempFilePath).catch(() => {});

  revalidatePath("/admin");
  revalidatePath("/library");

  redirect(`/admin/books/${book.id}`);
}