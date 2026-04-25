import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import type { Plan } from "@/lib/stripe";

type Props = {
  feature: string;
  requiredPlan: Exclude<Plan, "free">;
};

const planLabel: Record<Exclude<Plan, "free">, string> = {
  basic: "Basic",
  premium: "Premium",
};

export function PlanUpgradePrompt({ feature, requiredPlan }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <Lock className="h-10 w-10 text-muted-foreground" />
      <div className="space-y-1">
        <p className="font-medium">
          {feature}は{planLabel[requiredPlan]}プランの機能です
        </p>
        <p className="text-sm text-muted-foreground">
          プランをアップグレードするとこの機能を利用できます
        </p>
      </div>
      <Button asChild>
        <Link href="/settings/billing">プランを確認する</Link>
      </Button>
    </div>
  );
}
