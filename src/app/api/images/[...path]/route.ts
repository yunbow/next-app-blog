import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { resolve, sep } from "path";
import { logger } from "@/lib/logger";
import { fetchFromR2 } from "@/lib/storage/r2";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const imagePath = path.join("/");

  // セキュリティ: パストラバーサル対策
  const baseDir = resolve(process.cwd(), "public", "uploads");
  const filePath = resolve(baseDir, imagePath);
  if (!filePath.startsWith(baseDir + sep) && filePath !== baseDir) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  // 1. ローカルファイルから読み込み（standalone モード非対応のため通常は使わない）
  try {
    const raw = await readFile(filePath);
    const fileBuffer = new Uint8Array(raw.byteLength);
    fileBuffer.set(raw);
    const ext = imagePath.split(".").pop()?.toLowerCase() ?? "";
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
    return new NextResponse(new Blob([fileBuffer], { type: contentType }), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // fall through to R2/MinIO
  }

  // 2. R2 / MinIO から取得（S3 認証付き）
  const r2Data = await fetchFromR2(imagePath);
  if (r2Data) {
    return new NextResponse(new Blob([r2Data.body], { type: r2Data.contentType }), {
      headers: {
        "Content-Type": r2Data.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  logger.error({ imagePath }, "Image not found in local or R2");
  return new NextResponse("Image not found", { status: 404 });
}
