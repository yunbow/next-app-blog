"use server";

import { prisma } from "@/lib/prisma";
import { CreateArticleSchema, UpdateArticleSchema } from "../schema/article-schema";
import { generateSlug } from "../services/slug-utils";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth, requireOwnership } from "@/lib/actions/action-helpers";

export async function createArticleAction(data: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = CreateArticleSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { title, content, excerpt, tags, categoryId, images, status, scheduledAt } = parsed.data;

    const slug = await generateSlug(title);

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        thumbnail: images?.find((img) => img.type === "thumbnail")?.url || null,
        status: status === "published" ? "published" : status === "scheduled" ? "scheduled" : "draft",
        publishedAt: status === "published" ? new Date() : null,
        scheduledAt: status === "scheduled" && scheduledAt ? new Date(scheduledAt) : null,
        categoryId: categoryId || null,
        authorId: authResult.userId,
        images: images && images.length > 0 ? {
          create: images.map((img) => ({
            url: img.url,
            type: img.type,
            order: img.order || 0,
          })),
        } : undefined,
        tags: tags && tags.length > 0 ? {
          create: await Promise.all(
            tags.map(async (tagName) => {
              const tag = await prisma.tag.upsert({
                where: { name: tagName },
                update: {},
                create: { name: tagName },
              });
              return { tagId: tag.id };
            })
          ),
        } : undefined,
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");

    return { success: true, data: { id: article.id, slug: article.slug } };
  });
}

export async function updateArticleAction(articleId: string, data: unknown): Promise<ActionResult<{ slug: string }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    const ownershipResult = await requireOwnership(article, authResult.userId);
    if (!ownershipResult.success) return ownershipResult;

    const parsed = UpdateArticleSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tags, images, categoryId, ...updateData } = parsed.data;

    // バージョンを作成（重要な変更の場合）
    if (updateData.title !== ownershipResult.resource.title || updateData.content !== ownershipResult.resource.content) {
      const latestVersion = await prisma.articleVersion.findFirst({
        where: { articleId },
        orderBy: { version: "desc" },
      });

      const nextVersion = (latestVersion?.version || 0) + 1;

      await prisma.articleVersion.create({
        data: {
          articleId,
          version: nextVersion,
          title: ownershipResult.resource.title,
          content: ownershipResult.resource.content,
          excerpt: ownershipResult.resource.excerpt,
          thumbnail: ownershipResult.resource.thumbnail,
          changeNote: "自動保存",
        },
      });
    }

    // サムネイルURLを画像から取得
    const thumbnailUrl = images?.find((img) => img.type === "thumbnail")?.url;

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        ...updateData,
        thumbnail: thumbnailUrl !== undefined ? thumbnailUrl : undefined,
        publishedAt: updateData.status === "published" && !ownershipResult.resource.publishedAt ? new Date() : ownershipResult.resource.publishedAt,
        scheduledAt: updateData.status === "scheduled" && updateData.scheduledAt ? new Date(updateData.scheduledAt) : null,
        category: categoryId !== undefined ? (
          categoryId ? { connect: { id: categoryId } } : { disconnect: true }
        ) : undefined,
      },
    });

    // 画像の更新
    if (images !== undefined) {
      await prisma.articleImage.deleteMany({ where: { articleId } });
      if (images.length > 0) {
        await prisma.articleImage.createMany({
          data: images.map((img) => ({
            articleId,
            url: img.url,
            type: img.type,
            order: img.order,
          })),
        });
      }
    }

    if (tags !== undefined) {
      await prisma.articleTag.deleteMany({ where: { articleId } });

      if (tags.length > 0) {
        for (const tagName of tags) {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });
          await prisma.articleTag.create({
            data: { articleId, tagId: tag.id },
          });
        }
      }
    }

    revalidatePath("/");
    revalidatePath(`/articles/${updatedArticle.slug}`);
    revalidatePath("/dashboard");

    return { success: true, data: { slug: updatedArticle.slug } };
  });
}

export async function deleteArticleAction(articleId: string): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    const ownershipResult = await requireOwnership(article, authResult.userId);
    if (!ownershipResult.success) return ownershipResult;

    await prisma.article.delete({ where: { id: articleId } });

    revalidatePath("/");
    revalidatePath("/dashboard");

    return { success: true };
  });
}

export async function publishArticleAction(articleId: string): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    const ownershipResult = await requireOwnership(article, authResult.userId);
    if (!ownershipResult.success) return ownershipResult;

    await prisma.article.update({
      where: { id: articleId },
      data: {
        status: "published",
        publishedAt: new Date(),
      },
    });

    revalidatePath("/");
    revalidatePath(`/articles/${ownershipResult.resource.slug}`);
    revalidatePath("/dashboard");

    return { success: true };
  });
}
