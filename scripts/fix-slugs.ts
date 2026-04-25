import { PrismaClient } from "@prisma/client";
import { generateSlug } from "../src/features/article/services/slug-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Fixing Article Slugs ===\n");

  const articles = await prisma.article.findMany({
    select: { id: true, title: true, slug: true },
  });

  console.log(`Found ${articles.length} articles\n`);

  for (const article of articles) {
    const newSlug = await generateSlug(article.title);
    
    console.log(`Updating: ${article.title}`);
    console.log(`  Old slug: ${article.slug}`);
    console.log(`  New slug: ${newSlug}`);

    await prisma.article.update({
      where: { id: article.id },
      data: { slug: newSlug },
    });

    console.log("  ✓ Updated\n");
  }

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
