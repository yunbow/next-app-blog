"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth, requireOwnership } from "@/lib/actions/action-helpers";
import { ArticleIdSchema, ChangeNoteSchema, VersionIdSchema } from "../schema/article-schema";
import type { ArticleVersion } from "@prisma/client";
import { getUserPlan } from "@/lib/stripe/plan-gate";

export async function createVersionAction(articleId: string, changeNote?: string): Promise<ActionResult<ArticleVersion>> {
  return withAction(async () => {
    const parsedArticleId = ArticleIdSchema.safeParse(articleId);
    if (!parsedArticleId.success) {
      return { success: false, error: parsedArticleId.error.issues[0].message };
    }
    const parsedChangeNote = ChangeNoteSchema.safeParse(changeNote);
    if (!parsedChangeNote.success) {
      return { success: false, error: parsedChangeNote.error.issues[0].message };
    }

    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const { isPremium } = await getUserPlan(authResult.userId);
    if (!isPremium) {
      return { success: false, error: "バージョン履歴はPremiumプランの機能です。" };
    }

    const article = await prisma.article.findUnique({
      where: { id: parsedArticleId.data },
    });

    const ownershipResult = await requireOwnership(article, authResult.userId);
    if (!ownershipResult.success) return ownershipResult;

    // Get the latest version number
    const latestVersion = await prisma.articleVersion.findFirst({
      where: { articleId: parsedArticleId.data },
      orderBy: { version: "desc" },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    const version = await prisma.articleVersion.create({
      data: {
        articleId: parsedArticleId.data,
        version: nextVersion,
        title: ownershipResult.resource.title,
        content: ownershipResult.resource.content,
        excerpt: ownershipResult.resource.excerpt,
        thumbnail: ownershipResult.resource.thumbnail,
        changeNote: parsedChangeNote.data,
      },
    });

    revalidatePath(`/articles/edit/${parsedArticleId.data}`);
    return { success: true, data: version };
  });
}

export async function restoreVersionAction(articleId: string, versionId: string): Promise<ActionResult> {
  return withAction(async () => {
    const parsedArticleId = ArticleIdSchema.safeParse(articleId);
    if (!parsedArticleId.success) {
      return { success: false, error: parsedArticleId.error.issues[0].message };
    }
    const parsedVersionId = VersionIdSchema.safeParse(versionId);
    if (!parsedVersionId.success) {
      return { success: false, error: parsedVersionId.error.issues[0].message };
    }

    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const article = await prisma.article.findUnique({
      where: { id: parsedArticleId.data },
    });

    const ownershipResult = await requireOwnership(article, authResult.userId);
    if (!ownershipResult.success) return ownershipResult;

    const version = await prisma.articleVersion.findUnique({
      where: { id: parsedVersionId.data },
    });

    if (!version || version.articleId !== parsedArticleId.data) {
      return { success: false, error: "バージョンが見つかりません" };
    }

    // Create a new version with current content before restoring
    await createVersionAction(parsedArticleId.data, "復元前の自動保存");

    // Restore the version
    await prisma.article.update({
      where: { id: parsedArticleId.data },
      data: {
        title: version.title,
        content: version.content,
        excerpt: version.excerpt,
        thumbnail: version.thumbnail,
      },
    });

    revalidatePath(`/articles/edit/${parsedArticleId.data}`);
    return { success: true };
  });
}

export async function getArticleVersionsAction(articleId: string): Promise<ActionResult<ArticleVersion[]>> {
  return withAction(async () => {
    const parsedArticleId = ArticleIdSchema.safeParse(articleId);
    if (!parsedArticleId.success) {
      return { success: false, error: parsedArticleId.error.issues[0].message };
    }

    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const { isPremium } = await getUserPlan(authResult.userId);
    if (!isPremium) {
      return { success: false, error: "バージョン履歴はPremiumプランの機能です。" };
    }

    const article = await prisma.article.findUnique({
      where: { id: parsedArticleId.data },
    });

    const ownershipResult = await requireOwnership(article, authResult.userId);
    if (!ownershipResult.success) return ownershipResult;

    const versions = await prisma.articleVersion.findMany({
      where: { articleId: parsedArticleId.data },
      orderBy: { version: "desc" },
    });

    return { success: true, data: versions };
  });
}
