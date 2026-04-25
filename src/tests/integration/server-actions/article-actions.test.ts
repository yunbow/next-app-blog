import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Session } from "next-auth";
import type { Article } from "@prisma/client";

// Mock dependencies before importing
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    articleVersion: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    articleImage: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    articleTag: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    tag: {
      upsert: vi.fn(),
    },
  },
}));

import { createArticleAction, updateArticleAction, deleteArticleAction } from "@/features/article/server/article-actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const authMock = auth as unknown as Mock;

function mockSession(overrides?: Partial<Session["user"]>): Session {
  return {
    user: { id: "user-1", email: "test@example.com", name: null, image: null, ...overrides },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}

function mockArticle(overrides?: Partial<Article>): Article {
  return {
    id: "article-1",
    title: "Test Article",
    slug: "test-article",
    content: "Test content",
    excerpt: null,
    thumbnail: null,
    status: "draft",
    publishedAt: null,
    scheduledAt: null,
    authorId: "user-1",
    categoryId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Article;
}

describe("Article Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createArticleAction", () => {
    it("should return error if not authenticated", async () => {
      authMock.mockResolvedValue(null);

      const result = await createArticleAction({
        title: "Test Article",
        content: "Test content",
        excerpt: "Test excerpt",
        categoryId: "cat-1",
        tags: [],
        images: [],
        status: "draft",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("認証が必要です");
      }
    });

    it("should create article successfully", async () => {
      authMock.mockResolvedValue(mockSession());

      const article = mockArticle({ id: "article-1", slug: "test-article" });
      vi.mocked(prisma.article.create).mockResolvedValue(article);

      const result = await createArticleAction({
        title: "Test Article",
        content: "Test content",
        excerpt: "Test excerpt",
        categoryId: "cat-1",
        tags: [],
        images: [],
        status: "draft",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: article.id, slug: article.slug });
      }
      expect(prisma.article.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "Test Article",
            content: "Test content",
            authorId: "user-1",
          }),
        })
      );
    });

    it("should handle validation errors", async () => {
      authMock.mockResolvedValue(mockSession());

      const result = await createArticleAction({
        title: "",
        content: "Test content",
        excerpt: "Test excerpt",
        categoryId: "cat-1",
        tags: [],
        images: [],
        status: "draft",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("updateArticleAction", () => {
    it("should return error if not authenticated", async () => {
      authMock.mockResolvedValue(null);

      const result = await updateArticleAction("article-1", {
        title: "Updated Article",
        content: "Updated content",
        excerpt: "Updated excerpt",
        categoryId: "cat-1",
        tags: [],
        images: [],
        status: "draft",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("認証が必要です");
      }
    });

    it("should return error if article not found", async () => {
      authMock.mockResolvedValue(mockSession());
      vi.mocked(prisma.article.findUnique).mockResolvedValue(null);

      const result = await updateArticleAction("article-1", {
        title: "Updated Article",
        content: "Updated content",
        excerpt: "Updated excerpt",
        categoryId: "cat-1",
        tags: [],
        images: [],
        status: "draft",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("リソースが見つかりません");
      }
    });

    it("should return error if user is not the author", async () => {
      authMock.mockResolvedValue(mockSession());
      vi.mocked(prisma.article.findUnique).mockResolvedValue(
        mockArticle({ authorId: "user-2" })
      );

      const result = await updateArticleAction("article-1", {
        title: "Updated Article",
        content: "Updated content",
        excerpt: "Updated excerpt",
        categoryId: "cat-1",
        tags: [],
        images: [],
        status: "draft",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("このリソースへのアクセス権限がありません");
      }
    });

    it("should update article successfully", async () => {
      authMock.mockResolvedValue(mockSession());
      vi.mocked(prisma.article.findUnique).mockResolvedValue(
        mockArticle({ title: "Old Title", content: "Old content" })
      );

      const updatedArticle = mockArticle({
        title: "Updated Article",
        slug: "updated-article",
        content: "Updated content",
      });
      vi.mocked(prisma.article.update).mockResolvedValue(updatedArticle);

      const result = await updateArticleAction("article-1", {
        title: "Updated Article",
        content: "Updated content",
        excerpt: "Updated excerpt",
        categoryId: "cat-1",
        tags: [],
        images: [],
        status: "draft",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ slug: updatedArticle.slug });
      }
    });
  });

  describe("deleteArticleAction", () => {
    it("should return error if not authenticated", async () => {
      authMock.mockResolvedValue(null);

      const result = await deleteArticleAction("article-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("認証が必要です");
      }
    });

    it("should return error if article not found", async () => {
      authMock.mockResolvedValue(mockSession());
      vi.mocked(prisma.article.findUnique).mockResolvedValue(null);

      const result = await deleteArticleAction("article-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("リソースが見つかりません");
      }
    });

    it("should return error if user is not the author", async () => {
      authMock.mockResolvedValue(mockSession());
      vi.mocked(prisma.article.findUnique).mockResolvedValue(
        mockArticle({ authorId: "user-2" })
      );

      const result = await deleteArticleAction("article-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("このリソースへのアクセス権限がありません");
      }
    });

    it("should delete article successfully", async () => {
      authMock.mockResolvedValue(mockSession());
      vi.mocked(prisma.article.findUnique).mockResolvedValue(mockArticle());
      vi.mocked(prisma.article.delete).mockResolvedValue(mockArticle());

      const result = await deleteArticleAction("article-1");

      expect(result.success).toBe(true);
      expect(prisma.article.delete).toHaveBeenCalledWith({
        where: { id: "article-1" },
      });
    });
  });
});
