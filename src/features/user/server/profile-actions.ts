"use server";

import { prisma } from "@/lib/prisma";
import { UpdateProfileSchema } from "../schema/profile-schema";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";

export async function updateProfileAction(data: unknown): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = UpdateProfileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: parsed.data.username },
    });

    if (existingUsername && existingUsername.id !== authResult.userId) {
      return { success: false, error: "このユーザーIDは既に使用されています" };
    }

    await prisma.user.update({
      where: { id: authResult.userId },
      data: {
        name: parsed.data.name,
        username: parsed.data.username,
        bio: parsed.data.bio || null,
        image: parsed.data.image || null,
      },
    });

    revalidatePath(`/users/${authResult.userId}`);
    revalidatePath("/settings/profile");

    return { success: true };
  });
}
