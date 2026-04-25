import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { logger } from "@/lib/logger";
import { R2_ENABLED, uploadBlogImage } from "@/lib/storage/r2";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const rateLimitResult = await checkRateLimit(`upload:${session.user.id}`, 20, 60_000);
  if (!rateLimitResult.success) {
    logger.warn({ userId: session.user.id, ip: getClientIp(request) }, "Upload rate limit exceeded");
    const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
    const response = NextResponse.json({ error: "アップロードの制限を超えました。しばらくしてから再度お試しください。" }, { status: 429 });
    response.headers.set("X-RateLimit-Limit", "20");
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitResult.resetAt.toString());
    response.headers.set("Retry-After", retryAfter.toString());
    return response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "ファイルが必要です" }, { status: 400 });
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "ファイルサイズは5MB以下にしてください" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "JPG, PNG, GIF, WebPのみアップロード可能です" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const buffer = Buffer.from(await file.arrayBuffer());

    let url: string;

    if (R2_ENABLED) {
      url = await uploadBlogImage({
        userId: session.user.id,
        buffer,
        mimeType: file.type,
        ext,
      });
    } else {
      const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      url = `/uploads/${filename}`;
    }

    const response = NextResponse.json({ url });
    response.headers.set("X-RateLimit-Limit", "20");
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitResult.resetAt.toString());
    return response;
  } catch (error) {
    logger.error({ error }, "File upload failed");
    return NextResponse.json({ error: "ファイルのアップロードに失敗しました" }, { status: 500 });
  }
}
