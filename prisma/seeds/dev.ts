import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCommon } from "./common";

/**
 * 開発環境向け seed。
 * ローカル起動直後に動作確認できるよう、ユーザー3名・記事・タグ・コメント・
 * リアクション・フォロー関係まで一通り投入する。
 *
 * ログイン情報:
 *   alice@example.com   / password123
 *   bob@example.com     / password123
 *   charlie@example.com / password123
 */
export async function seedDev(prisma: PrismaClient) {
  console.log("[dev] master data");
  await seedCommon(prisma);

  console.log("[dev] users");
  const password = await bcrypt.hash("password123", 10);
  const premiumPriceId =
    process.env.STRIPE_PREMIUM_PRICE_ID ?? "price_premium_dev";
  const basicPriceId =
    process.env.STRIPE_BASIC_PRICE_ID ?? "price_basic_dev";
  const alicePremium = {
    stripePriceId: premiumPriceId,
    subscriptionStatus: "active",
    currentPeriodEnd: new Date("2099-12-31"),
  };
  const charlieBasic = {
    stripePriceId: basicPriceId,
    subscriptionStatus: "active",
    currentPeriodEnd: new Date("2099-12-31"),
  };
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: alicePremium,
    create: {
      email: "alice@example.com",
      username: "alice",
      name: "Alice Anderson",
      password,
      bio: "技術記事を中心に書いています。",
      emailVerified: new Date(),
      ...alicePremium,
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
  const charlie = await prisma.user.upsert({
    where: { email: "charlie@example.com" },
    update: charlieBasic,
    create: {
      email: "charlie@example.com",
      username: "charlie",
      name: "Charlie Carter",
      password,
      bio: "フロントエンドとアクセシビリティに関する記事を書いています。",
      emailVerified: new Date(),
      ...charlieBasic,
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
    {
      slug: "charlie-react-server-components",
      title: "React Server Components を業務で使ってみた所感",
      content:
        "# React Server Components を業務で使ってみた所感\n\nApp Router に移行して半年、Server Components が当たり前になった現場のリアルを共有します。\n\n## 良かったこと\n\n- バンドルサイズが目に見えて減る\n- データ取得とレンダリングが同じファイルで完結する\n\n## 気をつけたいこと\n\n- `\"use client\"` 境界を意識した設計\n- フォーム周りは Server Actions と組み合わせる",
      excerpt: "App Router 移行から半年経った現場視点での RSC の所感です。",
      authorId: charlie.id,
      categoryId: techCategory?.id ?? null,
      tagNames: ["nextjs", "typescript", "tips"],
    },
    {
      slug: "charlie-accessibility-checklist",
      title: "見落としがちなアクセシビリティ 5 つのチェック項目",
      content:
        "# 見落としがちなアクセシビリティ 5 つのチェック項目\n\n1. 画像の `alt` を空文字にしてよい場面を理解する\n2. フォーカスリングを安易に消さない\n3. ボタンとリンクの使い分け\n4. ランドマークロールで構造を伝える\n5. カラーコントラスト比 4.5:1 を最低ラインにする",
      excerpt: "アクセシビリティ対応で実務で見落とされがちなポイントをまとめました。",
      authorId: charlie.id,
      categoryId: techCategory?.id ?? null,
      tagNames: ["blog", "tips"],
    },
    {
      slug: "charlie-tailwind-design-tokens",
      title: "Tailwind CSS でデザイントークンを運用する",
      content:
        "# Tailwind CSS でデザイントークンを運用する\n\nデザインシステムと Tailwind の親和性は高いですが、`tailwind.config.ts` だけで管理しようとすると破綻しがちです。\n\n## おすすめの構成\n\n- トークンは JSON で一元管理\n- ビルド時に Tailwind の theme へ展開\n- Figma 側とは Style Dictionary で同期",
      excerpt: "Tailwind CSS でデザイントークンを破綻なく運用するための構成例です。",
      authorId: charlie.id,
      categoryId: techCategory?.id ?? null,
      tagNames: ["typescript", "tips"],
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

  console.log("[dev] follows (alice <-> bob, charlie -> alice/bob)");
  for (const [followerId, followingId] of [
    [alice.id, bob.id],
    [bob.id, alice.id],
    [charlie.id, alice.id],
    [charlie.id, bob.id],
    [alice.id, charlie.id],
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
  const charlieArticle = articles.find((a) => a.authorId === charlie.id);

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

  if (charlieArticle) {
    await prisma.reaction.upsert({
      where: {
        userId_articleId_type: {
          userId: alice.id,
          articleId: charlieArticle.id,
          type: "like",
        },
      },
      update: {},
      create: { userId: alice.id, articleId: charlieArticle.id, type: "like" },
    });
    const existing = await prisma.comment.findFirst({
      where: { articleId: charlieArticle.id, authorId: bob.id },
    });
    if (!existing) {
      await prisma.comment.create({
        data: {
          articleId: charlieArticle.id,
          authorId: bob.id,
          content: "RSC の実例、勉強になりました！",
        },
      });
    }
  }

  console.log("[dev] credentials:");
  console.log("  alice@example.com   / password123");
  console.log("  bob@example.com     / password123");
  console.log("  charlie@example.com / password123");
}
