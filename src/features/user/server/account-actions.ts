"use server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";

export async function deleteAccountAction(): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const rateLimitResult = await checkRateLimit(
      `deleteAccount:${authResult.userId}`,
      RATE_LIMITS.deleteAccount.limit,
      RATE_LIMITS.deleteAccount.windowMs
    );
    if (!rateLimitResult.success) {
      logger.warn({ userId: authResult.userId }, "Rate limit exceeded for deleteAccount");
      return { success: false, error: "リクエストが多すぎます。しばらくしてからもう一度お試しください。" };
    }

    await prisma.user.delete({
      where: { id: authResult.userId },
    });

    return { success: true };
  });
}
