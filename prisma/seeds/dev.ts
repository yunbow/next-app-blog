import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCommon } from "./common";

/**
 * 開発環境向け seed。
 * ローカル起動直後に動作確認できるよう、ユーザー2名・記事・タグ・コメント・
 * リアクション・フォロー関係まで一通り投入する。
 *
 * ログイン情報:
 *   alice@example.com / password123
 *   bob@example.com   / password123
 */
export async function seedDev(prisma: PrismaClient) {
  console.log("[dev] master data");
  await seedCommon(prisma);

  console.log("[dev] users");
  const password = await bcrypt.hash("password123", 10);
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      username: "alice",
      name: "Alice Anderson",
      password,
      bio: "技術記事を中心に書いています。",
      emailVerified: new Date(),
    },
  });
  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      username: "bob",
      name: "Bob Brown",
      password,
      bio: "ライフスタイルとビジネスについて書いています。",
      emailVerified: new Date(),
    },
  });

  console.log("[dev] tags");
  const tagNames = ["nextjs", "prisma", "typescript", "blog", "tips"];
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  const tagByName = new Map(tags.map((t) => [t.name, t]));

  const techCategory = await prisma.category.findUnique({
    where: { slug: "tech" },
  });
  const lifestyleCategory = await prisma.category.findUnique({
    where: { slug: "lifestyle" },
  });

  console.log("[dev] articles");
  const articleSeeds = [
    {
      slug: "alice-nextjs-getting-started",
      title: "Next.js で始めるブログ開発",
      content:
        "# Next.js で始めるブログ開発\n\nNext.js は React ベースのフレームワークで、App Router の登場により Server Components を中心とした構成が標準になりました。\n\n## 最初の一歩\n\n```bash\nnpx create-next-app@latest\n```\n\n本記事ではブログを題材に、ルーティング・データ取得・SEO の基本を整理します。",
      excerpt: "Next.js を使ったブログ構築の入門記事です。",
      authorId: alice.id,
      categoryId: techCategory?.id ?? null,
      tagNames: ["nextjs", "blog", "tips"],
    },
    {
      slug: "alice-prisma-tips",
      title: "Prisma で覚えておきたい 5 つの Tips",
      content:
        "# Prisma で覚えておきたい 5 つの Tips\n\n1. `upsert` で seed を冪等にする\n2. `select` で必要なカラムだけ取得する\n3. リレーションは `include` ではなく `select` を優先する\n4. トランザクションは `$transaction` でまとめる\n5. ログレベルを開発環境では `query` まで上げる",
      excerpt: "Prisma 利用時のベストプラクティスをまとめました。",
      authorId: alice.id,
      categoryId: techCategory?.id ?? null,
      tagNames: ["prisma", "typescript", "tips"],
    },
    {
      slug: "alice-typescript-strict",
      title: "TypeScript strict モードで安心して書くために",
      content:
        "# TypeScript strict モードで安心して書くために\n\n`strict: true` を有効にすると最初は型エラーに圧倒されますが、慣れてしまえば手放せません。\n\n## 最初に有効化したい設定\n\n- `noImplicitAny`\n- `strictNullChecks`\n- `noUncheckedIndexedAccess`\n\n型に守られると、リファクタリングが怖くなくなります。",
      excerpt: "TypeScript の strict モードを使いこなすための設定と考え方を紹介します。",
      authorId: alice.id,
      categoryId: techCategory?.id ?? null,
      tagNames: ["typescript", "tips"],
    },
    {
      slug: "bob-daily-routine",
      title: "在宅勤務を快適にする 1 日のルーチン",
      content:
        "# 在宅勤務を快適にする 1 日のルーチン\n\n在宅勤務 3 年目の私が実践しているルーチンを共有します。\n\n## 朝\n\n- 7:00 起床、5 分の散歩\n- 7:30 コーヒーを淹れて軽くストレッチ\n- 8:00 デスクに向かう前に今日のタスクを 3 つだけ書き出す",
      excerpt: "在宅勤務 3 年目の私が実践しているルーチンを紹介します。",
      authorId: bob.id,
      categoryId: lifestyleCategory?.id ?? null,
      tagNames: ["blog", "tips"],
    },
    {
      slug: "bob-side-business",
      title: "副業ブログを始めて分かった 3 つのこと",
      content:
        "# 副業ブログを始めて分かった 3 つのこと\n\n## 1. 継続が一番難しい\n## 2. ネタ切れは観察不足のサイン\n## 3. 最初の 3 ヶ月はアクセス数を見ない方が良い",
      excerpt: "副業としてブログ運営を始めた経験談です。",
      authorId: bob.id,
      categoryId: null,
      tagNames: ["blog"],
    },
    {
      slug: "bob-reading-habit",
      title: "読書習慣を続けるためにやめた 3 つのこと",
      content:
        "# 読書習慣を続けるためにやめた 3 つのこと\n\n読書を継続できるようになったのは、何かを足したのではなく、いくつかをやめたからでした。\n\n## 1. 全部読み切ろうとするのをやめる\n## 2. 紙か電子かで悩むのをやめる\n## 3. 感想を SNS に書こうとするのをやめる\n\n読書は誰のためでもなく、自分のための時間です。",
      excerpt: "読書を無理なく続けるために手放した習慣について書きました。",
      authorId: bob.id,
      categoryId: lifestyleCategory?.id ?? null,
      tagNames: ["blog", "tips"],
    },
  ];

  const articles = [];
  for (const seed of articleSeeds) {
    const article = await prisma.article.upsert({
      where: { slug: seed.slug },
      update: {},
      create: {
        slug: seed.slug,
        title: seed.title,
        content: seed.content,
        excerpt: seed.excerpt,
        status: "published",
        publishedAt: new Date(),
        authorId: seed.authorId,
        categoryId: seed.categoryId,
      },
    });
    for (const tagName of seed.tagNames) {
      const tag = tagByName.get(tagName);
      if (!tag) continue;
      await prisma.articleTag.upsert({
        where: {
          articleId_tagId: { articleId: article.id, tagId: tag.id },
        },
        update: {},
        create: { articleId: article.id, tagId: tag.id },
      });
    }
    articles.push(article);
    console.log(`  article: ${seed.title}`);
  }

  console.log("[dev] follows (alice <-> bob)");
  for (const [followerId, followingId] of [
    [alice.id, bob.id],
    [bob.id, alice.id],
  ] as const) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: {},
      create: { followerId, followingId },
    });
  }

  console.log("[dev] reactions / comments");
  const aliceArticle = articles.find((a) => a.authorId === alice.id);
  const bobArticle = articles.find((a) => a.authorId === bob.id);

  if (aliceArticle) {
    await prisma.reaction.upsert({
      where: {
        userId_articleId_type: {
          userId: bob.id,
          articleId: aliceArticle.id,
          type: "like",
        },
      },
      update: {},
      create: { userId: bob.id, articleId: aliceArticle.id, type: "like" },
    });
    const existing = await prisma.comment.findFirst({
      where: { articleId: aliceArticle.id, authorId: bob.id },
    });
    if (!existing) {
      await prisma.comment.create({
        data: {
          articleId: aliceArticle.id,
          authorId: bob.id,
          content: "とても参考になりました！",
        },
      });
    }
  }

  if (bobArticle) {
    await prisma.reaction.upsert({
      where: {
        userId_articleId_type: {
          userId: alice.id,
          articleId: bobArticle.id,
          type: "clap",
        },
      },
      update: {},
      create: { userId: alice.id, articleId: bobArticle.id, type: "clap" },
    });
    const existing = await prisma.comment.findFirst({
      where: { articleId: bobArticle.id, authorId: alice.id },
    });
    if (!existing) {
      await prisma.comment.create({
        data: {
          articleId: bobArticle.id,
          authorId: alice.id,
          content: "在宅ルーチンの参考にします！",
        },
      });
    }
  }

  console.log("[dev] credentials:");
  console.log("  alice@example.com / password123");
  console.log("  bob@example.com   / password123");
}
