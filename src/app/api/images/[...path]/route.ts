import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    
    // パスを結合
    const imagePath = path.join("/");
    
    // セキュリティ: パストラバーサル攻撃を防ぐ
    if (imagePath.includes("..") || imagePath.includes("~")) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    // 画像ファイルのパスを構築
    const filePath = join(process.cwd(), "public", "uploads", imagePath);

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
