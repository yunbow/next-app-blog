import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserBillingInfo } from "@/features/user/services/user-service";
import { getPlanFromPriceId } from "@/lib/stripe";
import { BillingContent } from "@/features/settings/components/BillingContent";
import { BackLink } from "@/components/common/BackLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/config/env";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const basicPriceId = env.STRIPE_BASIC_PRICE_ID;
  const premiumPriceId = env.STRIPE_PREMIUM_PRICE_ID;

  if (!basicPriceId || !premiumPriceId) {
    return (
      <div className="container max-w-4xl pb-8">
        <BackLink href="/settings" label="設定に戻る" />
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>プラン・お支払い</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              サブスクリプション機能は現在設定中です。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = await getUserBillingInfo(session.user.id);
  const currentPlan = getPlanFromPriceId(user?.stripePriceId);

  return (
    <div className="container max-w-4xl pb-8">
      <BackLink href="/settings" label="設定に戻る" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>プラン・お支払い</CardTitle>
        </CardHeader>
        <CardContent>
          <BillingContent
            currentPlan={currentPlan}
            subscriptionStatus={user?.subscriptionStatus ?? null}
            currentPeriodEnd={user?.currentPeriodEnd ?? null}
            basicPriceId={basicPriceId}
            premiumPriceId={premiumPriceId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
