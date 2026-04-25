import { describe, it, expect } from "vitest";
import { CreateArticleSchema, ArticleImageSchema } from "@/features/article/schema/article-schema";

describe("Article Schema", () => {
  describe("CreateArticleSchema", () => {
    it("should validate valid article data", () => {
      const validData = {
        title: "Test Article",
        content: "This is test content",
        excerpt: "Test excerpt",
        tags: ["test", "article"],
        categoryId: "cat-123",
        status: "draft" as const,
      };

      const result = CreateArticleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject article without title", () => {
      const invalidData = {
        content: "This is test content",
      };

      const result = CreateArticleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject article with title too long", () => {
      const invalidData = {
        title: "a".repeat(201),
        content: "This is test content",
      };

      const result = CreateArticleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject article with too many tags", () => {
      const invalidData = {
        title: "Test Article",
        content: "This is test content",
        tags: Array(11).fill("tag"),
      };

      const result = CreateArticleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("ArticleImageSchema", () => {
    it("should validate valid image data", () => {
      const validData = {
        url: "/uploads/image.jpg",
        type: "thumbnail" as const,
        order: 0,
      };

      const result = ArticleImageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject image without URL", () => {
      const invalidData = {
        type: "thumbnail" as const,
        order: 0,
      };

      const result = ArticleImageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject image with invalid type", () => {
      const invalidData = {
        url: "/uploads/image.jpg",
        type: "invalid",
        order: 0,
      };

      const result = ArticleImageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
