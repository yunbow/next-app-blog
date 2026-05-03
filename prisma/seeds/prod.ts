import type { PrismaClient } from "@prisma/client";
import { seedCommon } from "./common";

/**
 * 本番環境向け seed。
 * マスタデータのみを投入する。テストユーザーやサンプル記事は絶対に含めない。
 */
export async function seedProd(prisma: PrismaClient) {
  console.log("[prod] master data");
  await seedCommon(prisma);
}
