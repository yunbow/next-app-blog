"use server";

import { prisma } from "@/lib/prisma";
import { CreateCommentSchema, UpdateCommentSchema, CommentIdSchema } from "../schema/comment-schema";
import { revalidatePath } from "next/cache";
import { notificationEmitter } from "@/lib/events/notification-emitter";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth, requireOwnership } from "@/lib/actions/action-helpers";

export async function createCommentAction(data: unknown): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = CreateCommentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const article = await prisma.article.findUnique({
      where: { id: parsed.data.articleId },
      select: { authorId: true, slug: true },
    });

    if (!article) {
      return { success: false, error: "記事が見つかりません" };
    }

    await prisma.comment.create({
      data: {
        content: parsed.data.content,
        authorId: authResult.userId,
        articleId: parsed.data.articleId,
        parentId: parsed.data.parentId || null,
      },
    });

    // Notify article author
    if (article.authorId !== authResult.userId) {
      const notification = await prisma.notification.create({
        data: {
          type: "comment",
          recipientId: article.authorId,
          actorId: authResult.userId,
          articleId: parsed.data.articleId,
        },
        include: {
          actor: { select: { id: true, name: true, image: true, username: true } },
        },
      });
      notificationEmitter.emitNotification(article.authorId, notification);
    }

    revalidatePath(`/articles/${article.slug}`);
    return { success: true };
  });
}

export async function updateCommentAction(commentId: string, data: unknown): Promise<ActionResult> {
  return withAction(async () => {
    const parsedId = CommentIdSchema.safeParse(commentId);
    if (!parsedId.success) {
      return { success: false, error: parsedId.error.issues[0].message };
    }

    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const comment = await prisma.comment.findUnique({
      where: { id: parsedId.data },
      include: { article: { select: { slug: true } } },
    });

    const ownershipResult = await requireOwnership(comment, authResult.userId, "authorId");
    if (!ownershipResult.success) return ownershipResult;

    const parsed = UpdateCommentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await prisma.comment.update({
      where: { id: parsedId.data },
      data: { content: parsed.data.content },
    });

    revalidatePath(`/articles/${ownershipResult.resource.article.slug}`);
    return { success: true };
  });
}

export async function deleteCommentAction(commentId: string): Promise<ActionResult> {
  return withAction(async () => {
    const parsedId = CommentIdSchema.safeParse(commentId);
    if (!parsedId.success) {
      return { success: false, error: parsedId.error.issues[0].message };
    }

    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const comment = await prisma.comment.findUnique({
      where: { id: parsedId.data },
      include: { article: { select: { slug: true } } },
    });

    const ownershipResult = await requireOwnership(comment, authResult.userId, "authorId");
    if (!ownershipResult.success) return ownershipResult;

    await prisma.comment.delete({ where: { id: parsedId.data } });

    revalidatePath(`/articles/${ownershipResult.resource.article.slug}`);
    return { success: true };
  });
}
