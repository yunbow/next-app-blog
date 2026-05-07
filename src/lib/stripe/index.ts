import "server-only";
import Stripe from "stripe";

export type Plan = "free" | "basic" | "premium";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!stripeClient) {
    const host = process.env.STRIPE_API_URL;
    stripeClient = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      ...(host ? { host, port: 12111, protocol: "http" } : {}),
    });
  }
  return stripeClient;
}

export function getPlanFromPriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return "basic";
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return "premium";
  return "free";
}

export function isSubscriptionActive(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}
