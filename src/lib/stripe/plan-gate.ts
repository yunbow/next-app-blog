import "server-only";
import { prisma } from "@/lib/prisma";
import { getPlanFromPriceId, isSubscriptionActive, type Plan } from "@/lib/stripe";

export type PlanInfo = {
  plan: Plan;
  isPremium: boolean;
  isBasicOrAbove: boolean;
};

export async function getUserPlan(userId: string): Promise<PlanInfo> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripePriceId: true, subscriptionStatus: true },
  });

  const plan = getPlanFromPriceId(user?.stripePriceId);
  const active = isSubscriptionActive(user?.subscriptionStatus);
  const effectivePlan: Plan = active ? plan : "free";

  return {
    plan: effectivePlan,
    isPremium: effectivePlan === "premium",
    isBasicOrAbove: effectivePlan === "basic" || effectivePlan === "premium",
  };
}
