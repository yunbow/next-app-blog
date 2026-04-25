import "server-only";
import { prisma } from "@/lib/prisma";

const RESULTS_PER_PAGE = 12;

export async function searchArticles(params: {
  keyword?: string;
  tag?: string;
  categorySlug?: string;
  page?: number;
}) {
  const { keyword, tag, categorySlug, page = 1 } = params;
  const skip = (page - 1) * RESULTS_PER_PAGE;

  const where: {
    status: string;
    OR?: Array<{ title?: { contains: string }; content?: { contains: string } }>;
    tags?: { some: { tag: { name: string } } };
    category?: { slug: string };
  } = { status: "published" };

  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { content: { contains: keyword } },
    ];
  }

  if (tag) {
    where.tags = { some: { tag: { name: tag } } };
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: RESULTS_PER_PAGE,
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
    totalPages: Math.ceil(total / RESULTS_PER_PAGE),
    currentPage: page,
    total,
  };
}

export async function getArticlesByTag(tagName: string, page: number = 1) {
  return searchArticles({ tag: tagName, page });
}

export async function getArticlesByCategory(categorySlug: string, page: number = 1) {
  return searchArticles({ categorySlug, page });
}

export async function getPopularTags(limit: number = 20) {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { articles: { _count: "desc" } },
    take: limit,
  });
  return tags;
}
