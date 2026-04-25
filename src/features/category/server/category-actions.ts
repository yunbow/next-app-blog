"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { CreateCategorySchema } from "../schema/category-schema";

export async function createCategoryAction(name: string, slug: string): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    if (!authResult.session.user.isAdmin) {
      return { success: false, error: "管理者権限が必要です" };
    }

    const parsed = CreateCategorySchema.safeParse({ name, slug });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: parsed.data.name }, { slug: parsed.data.slug }] },
    });

    if (existing) {
      return { success: false, error: "このカテゴリは既に存在します" };
    }

    await prisma.category.create({ data: { name: parsed.data.name, slug: parsed.data.slug } });
    return { success: true };
  });
}
