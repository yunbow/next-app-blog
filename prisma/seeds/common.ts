import type { PrismaClient } from "@prisma/client";

/**
 * 本番・開発のどちらでも必要なマスタデータ。
 * カテゴリのようにアプリの動作に必須かつ環境依存しないものをここに置く。
 */
export async function seedCommon(prisma: PrismaClient) {
  const categories = [
    { name: "技術", slug: "tech" },
    { name: "ライフスタイル", slug: "lifestyle" },
    { name: "ビジネス", slug: "business" },
    { name: "エンターテイメント", slug: "entertainment" },
    { name: "その他", slug: "other" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`  category: ${category.name}`);
  }
}
