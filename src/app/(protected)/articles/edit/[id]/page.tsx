import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getArticleById } from "@/features/article/services/article-service";
import { ArticleForm } from "@/features/article/components/ArticleForm";
import { VersionHistory } from "@/features/article/components/VersionHistory";
import { BackLink } from "@/components/common/BackLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  if (article.authorId !== session.user.id) {
    redirect("/dashboard");
  }

  const [categories, images, versions] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.articleImage.findMany({
      where: { articleId: article.id },
      orderBy: { order: "asc" },
    }),
    prisma.articleVersion.findMany({
      where: { articleId: article.id },
      orderBy: { version: "desc" },
    }),
  ]);

  const initialData = {
    title: article.title,
    content: article.content,
    excerpt: article.excerpt || "",
    tags: article.tags.map((t) => t.tag.name),
    categoryId: article.categoryId || "",
    images: images.map((img) => ({
      url: img.url,
      type: img.type as "thumbnail" | "content",
      order: img.order,
    })),
    status: article.status as "draft" | "published" | "scheduled",
    scheduledAt: article.scheduledAt ? article.scheduledAt.toISOString().slice(0, 16) : "",
  };

  return (
    <div className="container max-w-6xl pb-8">
      <BackLink href="/dashboard" label="マイ記事に戻る" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">記事を編集</CardTitle>
            </CardHeader>
            <CardContent>
              <ArticleForm
                mode="edit"
                articleId={article.id}
                initialData={initialData}
                categories={categories}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <VersionHistory
            articleId={article.id}
            versions={versions}
            currentVersion={{
              title: article.title,
              content: article.content,
            }}
          />
        </div>
      </div>
    </div>
  );
}
