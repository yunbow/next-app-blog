"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth, requireOwnership } from "@/lib/actions/action-helpers";
import { ExportArticleSchema } from "../schema/export-schema";

export async function exportArticleAction(articleId: string, format: "json" | "markdown"): Promise<ActionResult<{ content: string; filename: string }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = ExportArticleSchema.safeParse({ articleId, format });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const article = await prisma.article.findUnique({
      where: { id: parsed.data.articleId },
      include: {
        category: { select: { name: true } },
        tags: { include: { tag: { select: { name: true } } } },
      },
    });

    if (!article) return { success: false, error: "記事が見つかりません" };

    const ownershipResult = await requireOwnership(article, authResult.userId);
    if (!ownershipResult.success) return ownershipResult;

    if (parsed.data.format === "markdown") {
      const frontmatter = [
        "---",
        `title: "${article.title}"`,
        article.excerpt ? `excerpt: "${article.excerpt}"` : null,
        article.category ? `category: "${article.category.name}"` : null,
        article.tags.length > 0 ? `tags: [${article.tags.map((t) => `"${t.tag.name}"`).join(", ")}]` : null,
        `date: "${article.createdAt.toISOString()}"`,
        "---",
        "",
      ].filter(Boolean).join("\n");

      return {
        success: true,
        data: {
          content: frontmatter + article.content,
          filename: `${article.slug}.md`,
        },
      };
    }

    const jsonData = {
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category?.name,
      tags: article.tags.map((t) => t.tag.name),
      status: article.status,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      publishedAt: article.publishedAt?.toISOString(),
    };

    return {
      success: true,
      data: {
        content: JSON.stringify(jsonData, null, 2),
        filename: `${article.slug}.json`,
      },
    };
  });
}
