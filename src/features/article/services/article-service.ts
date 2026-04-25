import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const ARTICLES_PER_PAGE = 12;

type ArticleFilters = {
  search?: string;
  categorySlug?: string;
  sort?: string;
  page?: number;
};

export async function getPublishedArticles(filters: ArticleFilters = {}) {
  const { search, categorySlug, sort = "latest", page = 1 } = filters;
  const skip = (page - 1) * ARTICLES_PER_PAGE;

  // Ensure search is a string or undefined, not a function, and not empty
  const searchString = typeof search === 'string' && search.trim() ? search.trim() : undefined;

  const where: Prisma.ArticleWhereInput = {
    status: "published",
    ...(searchString && {
      OR: [
        { title: { contains: searchString } },
        { content: { contains: searchString } },
        { excerpt: { contains: searchString } },
      ],
    }),
    ...(categorySlug && {
      category: { slug: categorySlug },
    }),
  };

  let orderBy: Prisma.ArticleOrderByWithRelationInput = { publishedAt: "desc" };
  if (sort === "oldest") orderBy = { publishedAt: "asc" };
  else if (sort === "popular") orderBy = { reactions: { _count: "desc" } };
  else if (sort === "title") orderBy = { title: "asc" };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip,
      take: ARTICLES_PER_PAGE,
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
        _count: { select: { comments: true, reactions: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles,
    totalPages: Math.ceil(total / ARTICLES_PER_PAGE),
    currentPage: page,
    total,
  };
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, image: true, username: true, bio: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
      _count: { select: { comments: true, reactions: true } },
    },
  });
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true, username: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
    },
  });
}

export async function getUserArticles(
  userId: string,
  filters: { status?: string; search?: string; sort?: string; page?: number } = {}
) {
  const { status, search, sort = "latest", page = 1 } = filters;
  const skip = (page - 1) * ARTICLES_PER_PAGE;

  // Ensure search is a string or undefined, not a function, and not empty
  const searchString = typeof search === 'string' && search.trim() ? search.trim() : undefined;

  const where: Prisma.ArticleWhereInput = {
    authorId: userId,
    ...(status && { status }),
    ...(searchString && {
      OR: [
        { title: { contains: searchString } },
        { content: { contains: searchString } },
      ],
    }),
  };

  let orderBy: Prisma.ArticleOrderByWithRelationInput = { updatedAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "title") orderBy = { title: "asc" };
  else if (sort === "published") orderBy = { publishedAt: "desc" };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip,
      take: ARTICLES_PER_PAGE,
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
        _count: { select: { comments: true, reactions: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles,
    totalPages: Math.ceil(total / ARTICLES_PER_PAGE),
    currentPage: page,
    total,
  };
}

export async function getUserDrafts(userId: string) {
  return getUserArticles(userId, { status: "draft" });
}

export async function getArticleImages(articleId: string) {
  return prisma.articleImage.findMany({
    where: { articleId },
    orderBy: { order: "asc" },
  });
}

export async function getArticleVersions(articleId: string) {
  return prisma.articleVersion.findMany({
    where: { articleId },
    orderBy: { version: "desc" },
  });
}
