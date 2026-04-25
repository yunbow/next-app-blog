import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ArticleForm } from "@/features/article/components/ArticleForm";
import { BackLink } from "@/components/common/BackLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCategories } from "@/features/category/services/category-service";
import { getUserPlan } from "@/lib/stripe/plan-gate";

export default async function NewArticlePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [categories, { isPremium, isBasicOrAbove }] = await Promise.all([
    getAllCategories(),
    getUserPlan(session.user.id),
  ]);

  return (
    <div className="container max-w-4xl pb-8">
      <BackLink href="/dashboard" label="マイ記事に戻る" />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">新規記事作成</CardTitle>
        </CardHeader>
        <CardContent>
          <ArticleForm
            mode="create"
            categories={categories}
            isPremium={isPremium}
            isBasicOrAbove={isBasicOrAbove}
          />
        </CardContent>
      </Card>
    </div>
  );
}
