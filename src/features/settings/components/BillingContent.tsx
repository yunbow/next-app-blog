"use client";

import { useTranslations } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTransition, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { createCheckoutSession, switchPlan, cancelSubscription } from "@/features/settings/server/subscription-actions";
import type { Plan } from "@/lib/stripe";

type Props = {
  currentPlan: Plan;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
  basicPriceId: string;
  premiumPriceId: string;
};

type PlanConfig = {
  key: Plan;
  priceId: string | null;
  label: string;
  description: string;
  price: string;
  features: string[];
};

const FREE_FEATURES = [
  "記事投稿（月3件まで）",
  "記事の閲覧・検索",
  "ブックマーク（コレクションなし）",
  "通知・フォロー",
];

const BASIC_FEATURES = [
  "記事投稿（無制限）",
  "ブックマーク（コレクションなし）",
  "通知・フォロー",
  "ログイン履歴",
];

const PREMIUM_FEATURES = [
  "記事投稿（無制限）",
  "スケジュール公開",
  "バージョン履歴・復元",
  "ブックマークコレクション",
  "データエクスポート",
];

export function BillingContent({
  currentPlan,
  subscriptionStatus,
  currentPeriodEnd,
  basicPriceId,
  premiumPriceId,
}: Props) {
  const { t } = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const hasActiveSubscription =
    subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const isCanceling = subscriptionStatus === "canceling";

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString() : "";

  function handleSwitchPlan(priceId: string) {
    startTransition(async () => {
      const result = await switchPlan(priceId);
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  function handleCancelConfirm() {
    setCancelDialogOpen(false);
    startTransition(async () => {
      const result = await cancelSubscription();
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  const plans: PlanConfig[] = [
    {
      key: "free",
      priceId: null,
      label: t("settings.planFree"),
      description: "基本的なブログ機能を無料で利用",
      price: "無料",
      features: FREE_FEATURES,
    },
    {
      key: "basic",
      priceId: basicPriceId,
      label: t("settings.planBasic"),
      description: t("settings.planBasicDescription"),
      price: "¥980 / 月",
      features: BASIC_FEATURES,
    },
    {
      key: "premium",
      priceId: premiumPriceId,
      label: t("settings.planPremium"),
      description: t("settings.planPremiumDescription"),
      price: "¥1,980 / 月",
      features: PREMIUM_FEATURES,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {t("settings.currentPlan")}:{" "}
          <span className="font-medium text-foreground">
            {currentPlan === "free"
              ? t("settings.planFree")
              : currentPlan === "basic"
                ? t("settings.planBasic")
                : t("settings.planPremium")}
          </span>
        </p>
        {currentPeriodEnd && (
          <p className="text-sm text-muted-foreground mt-1">
            {isCanceling
              ? t("settings.cancelsOn", { date: formatDate(currentPeriodEnd) })
              : t("settings.renewsOn", { date: formatDate(currentPeriodEnd) })}
          </p>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.key;

          return (
            <Card
              key={plan.key}
              className={`flex flex-col${isCurrent ? " border-primary" : ""}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {plan.label}
                  {isCurrent && (
                    <Badge variant="default" className="text-xs">
                      {t("settings.currentPlanBadge")}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-lg font-semibold text-foreground">
                  {plan.price}
                </CardDescription>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-4">
                <ul className="space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  {isCurrent ? (
                    <Button className="w-full" variant="outline" disabled>
                      {t("settings.currentPlanBadge")}
                    </Button>
                  ) : plan.priceId === null ? null : hasActiveSubscription ? (
                    <Button
                      className="w-full"
                      disabled={isPending}
                      onClick={() => handleSwitchPlan(plan.priceId!)}
                    >
                      {isPending ? t("settings.checkoutRedirecting") : t("settings.switchPlan")}
                    </Button>
                  ) : (
                    <form action={createCheckoutSession.bind(null, plan.priceId)}>
                      <Button className="w-full" type="submit" disabled={isPending}>
                        {t("settings.switchPlan")}
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hasActiveSubscription && !isCanceling && (
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={isPending}
            onClick={() => setCancelDialogOpen(true)}
          >
            {t("settings.cancelSubscription")}
          </Button>
        </div>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>サブスクリプションのキャンセル</DialogTitle>
            <DialogDescription>
              {t("settings.cancelConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              戻る
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={handleCancelConfirm}
            >
              キャンセルする
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
