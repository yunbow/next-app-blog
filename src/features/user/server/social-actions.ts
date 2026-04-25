"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notificationEmitter } from "@/lib/events/notification-emitter";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { FollowUserSchema } from "../schema/social-schema";

export async function followAction(userId: string): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = FollowUserSchema.safeParse({ userId });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    if (authResult.userId === parsed.data.userId) {
      return { success: false, error: "自分自身をフォローすることはできません" };
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: authResult.userId, followingId: parsed.data.userId } },
    });

    if (existing) {
      return { success: false, error: "既にフォローしています" };
    }

    await prisma.follow.create({
      data: { followerId: authResult.userId, followingId: parsed.data.userId },
    });

    const notification = await prisma.notification.create({
      data: {
        type: "follow",
        recipientId: parsed.data.userId,
        actorId: authResult.userId,
      },
      include: {
        actor: { select: { id: true, name: true, image: true, username: true } },
      },
    });
    notificationEmitter.emitNotification(parsed.data.userId, notification);

    revalidatePath(`/users/${parsed.data.userId}`);
    return { success: true };
  });
}

export async function unfollowAction(userId: string): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = FollowUserSchema.safeParse({ userId });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await prisma.follow.deleteMany({
      where: { followerId: authResult.userId, followingId: parsed.data.userId },
    });

    revalidatePath(`/users/${parsed.data.userId}`);
    return { success: true };
  });
}
