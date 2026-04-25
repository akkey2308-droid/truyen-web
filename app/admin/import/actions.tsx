"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import EPub from "epub2";
import AdmZip from "adm-zip";

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

  while (await prisma.book.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}

function decodeHtml(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(html: string) {
  return decodeHtml(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\r/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
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

function getImageExt(mimeType?: string, src?: string) {
  const safeMimeType = mimeType || "";
  const srcExt = src ? path.extname(src).replace(".", "").toLowerCase() : "";

  if (srcExt === "png") return "png";
  if (srcExt === "webp") return "webp";
  if (srcExt === "gif") return "gif";
  if (srcExt === "svg") return "svg";
  if (srcExt === "jpg" || srcExt === "jpeg" || srcExt === "jfif") return "jpg";

  if (safeMimeType.includes("image/png")) return "png";
  if (safeMimeType.includes("image/webp")) return "webp";
  if (safeMimeType.includes("image/gif")) return "gif";
  if (safeMimeType.includes("image/svg")) return "svg";
  if (safeMimeType.includes("image/jpeg")) return "jpg";

  return "jpg";
}

function normalizeZipPath(input: string) {
  return input
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^(\.\/)+/, "");
}

function isImagePath(filePath: string) {
  return /\.(png|jpe?g|jfif|webp|gif|svg)$/i.test(filePath);
}

function buildZipEntryMap(epubPath: string) {
  const zip = new AdmZip(epubPath);
  const map = new Map<string, AdmZip.IZipEntry>();

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;

    const entryName = normalizeZipPath(entry.entryName);
    map.set(entryName, entry);
    map.set(path.posix.basename(entryName), entry);
  }

  return map;
}

function buildImageMap(entryMap: Map<string, AdmZip.IZipEntry>) {
  const map = new Map<string, Buffer>();

  for (const [entryName, entry] of entryMap.entries()) {
    if (!isImagePath(entryName)) continue;

    const data = entry.getData();
    map.set(entryName, data);
    map.set(path.posix.basename(entryName), data);
  }

  return map;
}

function findChapterHtmlFromZip(
  entryMap: Map<string, AdmZip.IZipEntry>,
  chapterItem: any
) {
  const rawList = [
    chapterItem.href,
    chapterItem.url,
    chapterItem.id,
    chapterItem.idref,
  ]
    .filter(Boolean)
    .map((v) => normalizeZipPath(String(v)));

  const candidates = new Set<string>();

  for (const raw of rawList) {
    candidates.add(raw);
    candidates.add(raw.replace(/^(\.\.\/)+/, ""));
    candidates.add(path.posix.basename(raw));
  }

  for (const candidate of candidates) {
    const entry = entryMap.get(candidate);
    if (entry) return entry.getData().toString("utf8");
  }

  for (const [entryName, entry] of entryMap.entries()) {
    if (!/\.(xhtml|html|htm)$/i.test(entryName)) continue;

    for (const raw of rawList) {
      if (
        entryName.endsWith(raw) ||
        entryName.endsWith(path.posix.basename(raw))
      ) {
        return entry.getData().toString("utf8");
      }
    }
  }

  return "";
}

function resolveImageFromMap(
  imageMap: Map<string, Buffer>,
  src: string,
  chapterItem: any
) {
  const cleanSrc = normalizeZipPath(
    decodeURIComponent(src.split("?")[0].split("#")[0])
  );

  if (!cleanSrc || cleanSrc.startsWith("data:")) return null;

  const chapterHref = normalizeZipPath(
    String(chapterItem.href || chapterItem.url || "")
  );

  const chapterDir = path.posix.dirname(chapterHref);

  const resolved = normalizeZipPath(
    path.posix.normalize(path.posix.join(chapterDir, cleanSrc))
  );

  const withoutUp = resolved.replace(/^(\.\.\/)+/, "");
  const baseName = path.posix.basename(cleanSrc);

  return (
    imageMap.get(cleanSrc) ||
    imageMap.get(resolved) ||
    imageMap.get(withoutUp) ||
    imageMap.get(baseName) ||
    null
  );
}

async function saveImageBuffer(
  data: Buffer,
  src: string,
  slug: string,
  uploadDir: string
) {
  const ext = getImageExt("", src);
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}-${slug}.${ext}`;

  await fs.writeFile(path.join(uploadDir, fileName), data);

  return `/media/${fileName}`;
}

async function saveRemoteImage(src: string, slug: string, uploadDir: string) {
  try {
    const response = await fetch(src, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "";
    const ext = getImageExt(contentType, src);

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${slug}.${ext}`;

    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    return `/media/${fileName}`;
  } catch {
    return null;
  }
}

async function getCoverFromEpub(
  epub: any,
  imageMap: Map<string, Buffer>,
  slug: string,
  uploadDir: string
) {
  try {
    if (epub.cover) {
      const cover = await new Promise<string | null>((resolve) => {
        epub.getImage(
          epub.cover,
          async (err: unknown, data: Buffer, mimeType: string) => {
            if (err || !data) {
              resolve(null);
              return;
            }

            try {
              const ext = getImageExt(mimeType);
              const fileName = `${Date.now()}-${slug}-cover.${ext}`;

              await fs.writeFile(path.join(uploadDir, fileName), data);
              resolve(`/media/${fileName}`);
            } catch {
              resolve(null);
            }
          }
        );
      });

      if (cover) return cover;
    }
  } catch {}

  const preferredCover = Array.from(imageMap.entries()).find(([name]) =>
    /cover|front|title/i.test(name)
  );

  const firstImage = preferredCover || Array.from(imageMap.entries())[0];

  if (!firstImage) return null;

  const [src, data] = firstImage;

  return saveImageBuffer(data, src, `${slug}-cover`, uploadDir);
}

async function htmlToParagraphsWithImages(
  imageMap: Map<string, Buffer>,
  chapterHtml: string,
  chapterItem: any,
  slug: string,
  uploadDir: string
) {
  const result: string[] = [];

  const imgRegex =
    /<(?:img|image)[^>]+(?:src|href|xlink:href)=["']([^"']+)["'][^>]*>/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(chapterHtml)) !== null) {
    const beforeHtml = chapterHtml.slice(lastIndex, match.index);
    const beforeText = stripHtml(beforeHtml);

    if (beforeText) {
      result.push(...splitParagraphs(beforeText));
    }

    const src = match[1];
    let mediaPath: string | null = null;

    if (src.startsWith("http://") || src.startsWith("https://")) {
      mediaPath = await saveRemoteImage(src, slug, uploadDir);
    } else {
      const imageBuffer = resolveImageFromMap(imageMap, src, chapterItem);

      if (imageBuffer) {
        mediaPath = await saveImageBuffer(imageBuffer, src, slug, uploadDir);
      }
    }

    if (mediaPath) {
      result.push(`[[IMAGE:${mediaPath}]]`);
    }

    lastIndex = match.index + match[0].length;
  }

  const afterHtml = chapterHtml.slice(lastIndex);
  const afterText = stripHtml(afterHtml);

  if (afterText) {
    result.push(...splitParagraphs(afterText));
  }

  return result;
}

export async function importEpub(formData: FormData) {
  const file = formData.get("epub") as File | null;

  if (!file || file.size === 0) {
    throw new Error("Chưa chọn file EPUB.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const tempDir = path.join(process.cwd(), "temp");
  const uploadDir =
    process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

  await fs.mkdir(tempDir, { recursive: true });
  await fs.mkdir(uploadDir, { recursive: true });

  const tempFilePath = path.join(tempDir, `${Date.now()}-${file.name}`);
  await fs.writeFile(tempFilePath, buffer);

  const epub = await parseEpub(tempFilePath);
  const entryMap = buildZipEntryMap(tempFilePath);
  const imageMap = buildImageMap(entryMap);

  const title = String(epub.metadata?.title || "Untitled").trim();
  const description = String(epub.metadata?.description || "").trim() || null;
  const slug = await makeUniqueSlug(slugify(title));

  const cover = await getCoverFromEpub(epub, imageMap, slug, uploadDir);

  const flowItems = Array.isArray(epub.flow)
    ? epub.flow.filter((item: any) => item && item.id)
    : [];

  if (flowItems.length === 0) {
    await fs.unlink(tempFilePath).catch(() => {});
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
    let chapterHtml = findChapterHtmlFromZip(entryMap, item);

    if (!chapterHtml) {
      chapterHtml = await new Promise<string>((resolve) => {
        epub.getChapter(item.id, (err: unknown, text: string) => {
          if (err) {
            resolve("");
            return;
          }

          resolve(text || "");
        });
      });
    }

    if (!chapterHtml.trim()) continue;

    const chapterTitle =
      String(item.title || "").trim() || `Chương ${chapterNumber}`;

    const paragraphs = await htmlToParagraphsWithImages(
      imageMap,
      chapterHtml,
      item,
      slug,
      uploadDir
    );

    if (paragraphs.length === 0) continue;

    const chapter = await prisma.chapter.create({
      data: {
        bookId: book.id,
        chapterNumber,
        title: chapterTitle,
      },
    });

    await prisma.chapterParagraph.createMany({
      data: paragraphs.map((paragraph, index) => ({
        chapterId: chapter.id,
        orderIndex: index + 1,
        content: paragraph,
      })),
    });

    chapterNumber++;
  }

  await fs.unlink(tempFilePath).catch(() => {});

  revalidatePath("/admin");
  revalidatePath("/library");

  redirect(`/admin/books/${book.id}`);
}