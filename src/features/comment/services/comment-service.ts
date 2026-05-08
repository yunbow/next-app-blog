import "server-only";
import { prisma } from "@/lib/prisma";

export async function getArticleComments(articleId: string) {
  return prisma.comment.findMany({
    where: { articleId },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, image: true, username: true } },
    },
  });
}
