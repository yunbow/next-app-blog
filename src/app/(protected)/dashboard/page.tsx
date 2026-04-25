import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserArticles } from "@/features/article/services/article-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { DeleteArticleButton } from "@/features/article/components/DeleteArticleButton";
import { Pagination } from "@/components/common/Pagination";
import { DashboardFilters } from "@/components/common/DashboardFilters";

type Props = {
  searchParams: Promise<{ tab?: string; q?: string; sort?: string; page?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const tab = params.tab || "published";
  const page = parseInt(params.page || "1", 10);

  const [published, drafts, scheduled] = await Promise.all([
    getUserArticles(session.user.id, {
      status: "published",
      search: tab === "published" && params.q ? params.q : undefined,
      sort: tab === "published" && params.sort ? params.sort : undefined,
      page: tab === "published" ? page : 1,
    }),
    getUserArticles(session.user.id, {
      status: "draft",
      search: tab === "drafts" && params.q ? params.q : undefined,
      sort: tab === "drafts" && params.sort ? params.sort : undefined,
      page: tab === "drafts" ? page : 1,
    }),
    getUserArticles(session.user.id, {
      status: "scheduled",
      search: tab === "scheduled" && params.q ? params.q : undefined,
      sort: tab === "scheduled" && params.sort ? params.sort : undefined,
      page: tab === "scheduled" ? page : 1,
    }),
  ]);

  const ArticleRow = ({ article }: { article: typeof published.articles[0] }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        <Link
          href={article.status === "published" ? `/articles/${article.slug}` : `/articles/edit/${article.id}`}
          className="font-medium hover:underline line-clamp-1"
        >
          {article.title}
        </Link>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{format(article.updatedAt, "yyyy/MM/dd HH:mm")}</span>
          {article.category && <Badge variant="outline" className="text-xs">{article.category.name}</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Link href={`/articles/edit/${article.id}`}>
          <Button variant="ghost" size="sm">編集</Button>
        </Link>
        <DeleteArticleButton articleId={article.id} />
      </div>
    </div>
  );

  return (
    <div className="container max-w-4xl pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">マイ記事</h1>
        <Link href="/articles/new">
          <Button>新規作成</Button>
        </Link>
      </div>

      <Tabs value={tab} defaultValue="published">
        <TabsList>
          <Link href="/dashboard?tab=published">
            <TabsTrigger value="published">公開 ({published.total})</TabsTrigger>
          </Link>
          <Link href="/dashboard?tab=drafts">
            <TabsTrigger value="drafts">下書き ({drafts.total})</TabsTrigger>
          </Link>
          <Link href="/dashboard?tab=scheduled">
            <TabsTrigger value="scheduled">予約 ({scheduled.total})</TabsTrigger>
          </Link>
        </TabsList>

        <TabsContent value="published">
          <DashboardFilters basePath="/dashboard?tab=published" />
          {published.articles.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">公開済みの記事はありません</p>
          ) : (
            <>
              {published.articles.map((article) => (
                <ArticleRow key={article.id} article={article} />
              ))}
              <Pagination
                currentPage={published.currentPage}
                totalPages={published.totalPages}
                basePath="/dashboard"
                searchParams={{ 
                  tab: "published", 
                  ...(params.q && { q: params.q }),
                  ...(params.sort && { sort: params.sort })
                }}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="drafts">
          <DashboardFilters basePath="/dashboard?tab=drafts" />
          {drafts.articles.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">下書きはありません</p>
          ) : (
            <>
              {drafts.articles.map((article) => (
                <ArticleRow key={article.id} article={article} />
              ))}
              <Pagination
                currentPage={drafts.currentPage}
                totalPages={drafts.totalPages}
                basePath="/dashboard"
                searchParams={{ 
                  tab: "drafts", 
                  ...(params.q && { q: params.q }),
                  ...(params.sort && { sort: params.sort })
                }}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="scheduled">
          <DashboardFilters basePath="/dashboard?tab=scheduled" />
          {scheduled.articles.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">予約記事はありません</p>
          ) : (
            <>
              {scheduled.articles.map((article) => (
                <ArticleRow key={article.id} article={article} />
              ))}
              <Pagination
                currentPage={scheduled.currentPage}
                totalPages={scheduled.totalPages}
                basePath="/dashboard"
                searchParams={{ 
                  tab: "scheduled", 
                  ...(params.q && { q: params.q }),
                  ...(params.sort && { sort: params.sort })
                }}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
