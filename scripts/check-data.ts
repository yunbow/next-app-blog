import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Checking Database ===\n");

  // ユーザー確認
  const users = await prisma.user.findMany({
    select: { id: true, email: true, username: true },
  });
  console.log("Users:", users.length);
  users.forEach((user) => {
    console.log(`  - ${user.email} (ID: ${user.id})`);
  });

  // カテゴリ確認
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
  });
  console.log("\nCategories:", categories.length);
  categories.forEach((cat) => {
    console.log(`  - ${cat.name} (ID: ${cat.id}, slug: ${cat.slug})`);
  });

  // タグ確認
  const tags = await prisma.tag.findMany({
    select: { id: true, name: true },
  });
  console.log("\nTags:", tags.length);
  tags.forEach((tag) => {
    console.log(`  - ${tag.name} (ID: ${tag.id})`);
  });

  // 記事確認
  const articles = await prisma.article.findMany({
    select: { 
      id: true, 
      title: true, 
      slug: true, 
      status: true,
      publishedAt: true,
      author: { select: { email: true } }
    },
  });
  console.log("\nArticles:", articles.length);
  articles.forEach((article) => {
    console.log(`  - ${article.title}`);
    console.log(`    ID: ${article.id}`);
    console.log(`    Slug: ${article.slug}`);
    console.log(`    Status: ${article.status}`);
    console.log(`    Author: ${article.author.email}`);
    console.log(`    Published: ${article.publishedAt || 'Not published'}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
