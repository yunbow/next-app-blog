import "server-only";
import { prisma } from "@/lib/prisma";

const COMMENTS_PER_PAGE = 20;

export async function getArticleComments(articleId: string, page = 1) {
  const skip = (page - 1) * COMMENTS_PER_PAGE;
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { articleId },
      orderBy: { createdAt: "asc" },
      skip,
      take: COMMENTS_PER_PAGE,
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
      },
    }),
    prisma.comment.count({ where: { articleId } }),
  ]);
  return { comments, total, totalPages: Math.ceil(total / COMMENTS_PER_PAGE) };
}
