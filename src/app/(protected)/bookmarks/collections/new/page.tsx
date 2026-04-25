import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserPlan } from "@/lib/stripe/plan-gate";
import { CollectionForm } from "@/features/bookmark/components/CollectionForm";
import { BackLink } from "@/components/common/BackLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanUpgradePrompt } from "@/components/common/PlanUpgradePrompt";

export default async function NewCollectionPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { isPremium } = await getUserPlan(session.user.id);

  return (
    <div className="container max-w-2xl pb-8">
      <BackLink href="/bookmarks" label="ブックマークに戻る" />
      <h1 className="text-2xl font-bold mb-6">新しいコレクション</h1>
      {isPremium ? (
        <CollectionForm mode="create" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>新しいコレクション</CardTitle>
          </CardHeader>
          <CardContent>
            <PlanUpgradePrompt
              feature="ブックマークコレクション"
              requiredPlan="premium"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
