"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import type { ActionResult } from "@/lib/types/action-result";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createCheckoutSession(priceId: string): Promise<never> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true },
  });

  const stripe = getStripe();

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email ?? undefined });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/settings/billing?success=1`,
    cancel_url: `${APP_URL}/settings/billing`,
  });

  redirect(checkoutSession.url!);
}

export async function switchPlan(priceId: string): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: authResult.userId },
      select: { stripeSubscriptionId: true },
    });

    if (!user.stripeSubscriptionId) {
      return { success: false, error: "切り替え対象のサブスクリプションが見つかりません" };
    }

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [{ id: subscription.items.data[0].id, price: priceId }],
      proration_behavior: "always_invoice",
    });

    await prisma.user.update({
      where: { id: authResult.userId },
      data: { stripePriceId: priceId },
    });

    return { success: true };
  });
}

export async function cancelSubscription(): Promise<ActionResult> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: authResult.userId },
      select: { stripeSubscriptionId: true },
    });

    if (!user.stripeSubscriptionId) {
      return { success: false, error: "キャンセル対象のサブスクリプションが見つかりません" };
    }

    const stripe = getStripe();
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.user.update({
      where: { id: authResult.userId },
      data: { subscriptionStatus: "canceling" },
    });

    return { success: true };
  });
}
