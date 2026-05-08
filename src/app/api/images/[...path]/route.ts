import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { resolve, sep } from "path";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    
    // パスを結合
    const imagePath = path.join("/");

    // セキュリティ: path.resolve() でパストラバーサル攻撃を防ぐ
    const baseDir = resolve(process.cwd(), "public", "uploads");
    const filePath = resolve(baseDir, imagePath);
    if (!filePath.startsWith(baseDir + sep) && filePath !== baseDir) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    // ファイルを読み込む
    const fileBuffer = await readFile(filePath);

    // Content-Typeを設定
    const ext = imagePath.split(".").pop()?.toLowerCase();
    const contentType = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
    }[ext || ""] || "application/octet-stream";

    // 画像を返す
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    logger.error({ error }, "Error serving image");
    return new NextResponse("Image not found", { status: 404 });
  }
}
