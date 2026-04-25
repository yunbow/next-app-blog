"use server";

import { prisma } from "@/lib/prisma";
import { notificationEmitter } from "@/lib/events/notification-emitter";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { ToggleReactionSchema, ArticleIdSchema, UserIdSchema } from "../schema/reaction-schema";

export async function toggleReactionAction(articleId: string, type: string): Promise<ActionResult<{ added: boolean }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = ToggleReactionSchema.safeParse({ articleId, type });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const existing = await prisma.reaction.findUnique({
      where: {
        userId_articleId_type: {
          userId: authResult.userId,
          articleId: parsed.data.articleId,
          type: parsed.data.type,
        },
      },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      return { success: true, data: { added: false as boolean } };
    }

    const article = await prisma.article.findUnique({
      where: { id: parsed.data.articleId },
      select: { authorId: true, slug: true },
    });

    if (!article) {
      return { success: false, error: "記事が見つかりません" };
    }

    await prisma.reaction.create({
      data: { type: parsed.data.type, userId: authResult.userId, articleId: parsed.data.articleId },
    });

    if (article.authorId !== authResult.userId) {
      const notification = await prisma.notification.create({
        data: {
          type: "reaction",
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

    return { success: true, data: { added: true as boolean } };
  });
}

export async function getReactionStats(articleId: string): Promise<Record<string, number>> {
  const parsed = ArticleIdSchema.safeParse(articleId);
  if (!parsed.success) {
    return {};
  }

  const reactions = await prisma.reaction.groupBy({
    by: ["type"],
    where: { articleId: parsed.data },
    _count: { type: true },
  });

  return reactions.reduce((acc, r) => {
    acc[r.type] = r._count.type;
    return acc;
  }, {} as Record<string, number>);
}

export async function getUserReactions(articleId: string, userId: string): Promise<string[]> {
  const parsedArticleId = ArticleIdSchema.safeParse(articleId);
  const parsedUserId = UserIdSchema.safeParse(userId);
  if (!parsedArticleId.success || !parsedUserId.success) {
    return [];
  }

  const reactions = await prisma.reaction.findMany({
    where: { articleId: parsedArticleId.data, userId: parsedUserId.data },
    select: { type: true },
  });
  return reactions.map((r) => r.type);
}
