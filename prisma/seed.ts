import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // カテゴリの作成
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
    console.log(`Created category: ${category.name}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
