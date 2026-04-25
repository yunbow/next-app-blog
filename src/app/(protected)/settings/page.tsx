import { auth } from "@/lib/auth";
import { getUserPlanInfo } from "@/features/user/services/user-service";
import { getPlanFromPriceId } from "@/lib/stripe";
import { SettingsContent } from "@/features/settings/components";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserPlanInfo(session.user.id);
  const currentPlan = getPlanFromPriceId(user?.stripePriceId);

  return <SettingsContent currentPlan={currentPlan} />;
}
