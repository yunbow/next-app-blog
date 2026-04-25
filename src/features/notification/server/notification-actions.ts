"use server";

import { prisma } from "@/lib/prisma";
import { markAsRead, markAllAsRead } from "../services/notification-service";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { NotificationIdSchema } from "../schema/notification-schema";

export async function markAsReadAction(notificationId: string): Promise<ActionResult> {
  return withAction(async () => {
    const parsedId = NotificationIdSchema.safeParse(notificationId);
    if (!parsedId.success) {
      return { success: false, error: parsedId.error.issues[0].message };
    }

    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    // IDOR対策: 通知の所有者確認
    const notification = await prisma.notification.findUnique({
      where: { id: parsedId.data },
      select: { recipientId: true },
    });

    if (!notification) {
      return { success: false, error: "通知が見つかりません" };
    }

    if (notification.recipientId !== authResult.userId) {
      return { success: false, error: "この通知にアクセスする権限がありません" };
    }

    await markAsRead(parsedId.data);
    revalidatePath("/notifications");
    return { success: true };
  });
}

export async function markAllAsReadAction(): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    await markAllAsRead(authResult.userId);
    revalidatePath("/notifications");
    return { success: true };
  });
}
