"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ChangePasswordSchema } from "../schema/password-schema";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const rateLimitResult = await checkRateLimit(
      `changePassword:${authResult.userId}`,
      RATE_LIMITS.changePassword.limit,
      RATE_LIMITS.changePassword.windowMs
    );
    if (!rateLimitResult.success) {
      logger.warn({ userId: authResult.userId }, "Rate limit exceeded for changePassword");
      return { success: false, error: "リクエストが多すぎます。しばらくしてからもう一度お試しください。" };
    }

    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    const parsed = ChangePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
    });

    if (!user || !user.password) {
      return { success: false, error: "パスワードの変更に失敗しました" };
    }

    const isValidPassword = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!isValidPassword) {
      return { success: false, error: "現在のパスワードが正しくありません" };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10);

    await prisma.user.update({
      where: { id: authResult.userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  });
}
