import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ filename: string }>;
};

export async function GET(_: Request, { params }: Props) {
  const { filename } = await params;

  const safeName = path.basename(filename);
  const uploadDir =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

const filePath = path.join(uploadDir, safeName);

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();

    let contentType = "application/octet-stream";

    if (ext === ".jpg" || ext === ".jpeg" || ext === ".jfif") {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".webp") {
      contentType = "image/webp";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    }

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}