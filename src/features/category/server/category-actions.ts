"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { CreateCategorySchema } from "../schema/category-schema";

export async function createCategoryAction(name: string, slug: string): Promise<ActionResult> {
  try {
    const parsed = CreateCategorySchema.safeParse({ name, slug });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const session = await auth();
    if (!session?.user?.isAdmin) {
      return { success: false, error: "管理者権限が必要です" };
    }

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: parsed.data.name }, { slug: parsed.data.slug }] },
    });

    if (existing) {
      return { success: false, error: "このカテゴリは既に存在します" };
    }

    await prisma.category.create({ data: { name: parsed.data.name, slug: parsed.data.slug } });
    return { success: true };
  } catch (error) {
    logger.error({ error }, "カテゴリの作成に失敗しました");
    return { success: false, error: "処理に失敗しました" };
  }
}
