import "server-only";
import { prisma } from "@/lib/prisma";

export async function getNotifications(userId: string, limit: number = 50) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: { id: true, name: true, image: true, username: true } },
      article: { select: { slug: true, title: true } },
    },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { recipientId: userId, read: false },
  });
}

export async function markAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { recipientId: userId, read: false },
    data: { read: true },
  });
}
