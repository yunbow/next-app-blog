import "server-only";
import { prisma } from "@/lib/prisma";

const BOOKMARKS_PER_PAGE = 12;

const ARTICLE_INCLUDE = {
  author: { select: { id: true, name: true, image: true, username: true } },
  category: { select: { id: true, name: true, slug: true } },
  tags: { include: { tag: { select: { id: true, name: true } } } },
  _count: { select: { comments: true, reactions: true } },
} as const;

export async function getUserBookmarks(userId: string, page = 1) {
  const skip = (page - 1) * BOOKMARKS_PER_PAGE;
  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      include: {
        article: { include: ARTICLE_INCLUDE },
        collection: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: BOOKMARKS_PER_PAGE,
    }),
    prisma.bookmark.count({ where: { userId } }),
  ]);
  return { bookmarks, total, totalPages: Math.ceil(total / BOOKMARKS_PER_PAGE) };
}

export async function getUserCollections(userId: string) {
  return prisma.bookmarkCollection.findMany({
    where: { userId },
    include: { _count: { select: { bookmarks: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCollectionWithBookmarks(id: string, page = 1) {
  const skip = (page - 1) * BOOKMARKS_PER_PAGE;
  return prisma.bookmarkCollection.findUnique({
    where: { id },
    include: {
      bookmarks: {
        include: {
          article: { include: ARTICLE_INCLUDE },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: BOOKMARKS_PER_PAGE,
      },
      _count: { select: { bookmarks: true } },
    },
  });
}

export async function getCollectionById(id: string) {
  return prisma.bookmarkCollection.findUnique({ where: { id } });
}

export async function getUserBookmarkForArticle(userId: string, articleId: string) {
  return prisma.bookmark.findUnique({
    where: { userId_articleId: { userId, articleId } },
    select: { id: true, collectionId: true },
  });
}

export async function getUserCollectionList(userId: string) {
  return prisma.bookmarkCollection.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
