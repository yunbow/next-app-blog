import { ArticleForm } from "@/features/article/components/ArticleForm";
import { BackLink } from "@/components/common/BackLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container max-w-4xl pb-8">
      <BackLink href="/dashboard" label="マイ記事に戻る" />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">新規記事作成</CardTitle>
        </CardHeader>
        <CardContent>
          <ArticleForm mode="create" categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
