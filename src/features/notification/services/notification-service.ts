import "server-only";
import { prisma } from "@/lib/prisma";

const NOTIFICATIONS_PER_PAGE = 20;

export async function getNotifications(userId: string, page = 1) {
  const skip = (page - 1) * NOTIFICATIONS_PER_PAGE;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: NOTIFICATIONS_PER_PAGE,
      include: {
        actor: { select: { id: true, name: true, image: true, username: true } },
        article: { select: { slug: true, title: true } },
      },
    }),
    prisma.notification.count({ where: { recipientId: userId } }),
  ]);
  return { notifications, total, totalPages: Math.ceil(total / NOTIFICATIONS_PER_PAGE) };
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
