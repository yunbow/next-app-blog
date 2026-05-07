import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanFromPriceId } from "@/lib/stripe";
import { SettingsContent } from "@/features/settings/components";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripePriceId: true, subscriptionStatus: true },
  });

  const currentPlan = getPlanFromPriceId(user?.stripePriceId);

  return <SettingsContent currentPlan={currentPlan} />;
}
