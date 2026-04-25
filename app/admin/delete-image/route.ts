import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const body = await request.json();
  const mediaPath = String(body.mediaPath || "");

  if (!mediaPath.startsWith("/media/")) {
    return NextResponse.json({ error: "Đường dẫn ảnh không hợp lệ." }, { status: 400 });
  }

  const fileName = path.basename(mediaPath);

  const uploadDir =
    process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

  const filePath = path.join(uploadDir, fileName);

  try {
    await fs.unlink(filePath);
  } catch {
    // file không tồn tại thì bỏ qua
  }

  return NextResponse.json({ ok: true });
}