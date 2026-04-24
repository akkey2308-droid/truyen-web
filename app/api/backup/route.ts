import { prisma } from "@/lib/prisma";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

export async function GET() {
  const [books, chapters, paragraphs, comments, progress] = await Promise.all([
    prisma.book.findMany(),
    prisma.chapter.findMany(),
    prisma.chapterParagraph.findMany(),
    prisma.paragraphComment.findMany(),
    prisma.readingProgress.findMany(),
  ]);

  const zip = new AdmZip();

  zip.addFile(
    "backup.json",
    Buffer.from(
      JSON.stringify(
        {
          version: 1,
          createdAt: new Date().toISOString(),
          books,
          chapters,
          paragraphs,
          comments,
          progress,
        },
        null,
        2
      )
    )
  );

  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        zip.addLocalFile(filePath, "uploads");
      }
    }
  }

  const buffer = zip.toBuffer();
  const fileName = `scholar-night-backup-${Date.now()}.zip`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}