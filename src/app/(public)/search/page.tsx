import { searchArticles, getPopularTags } from "@/features/search/services/search-service";
import { getPublishedArticles } from "@/features/article/services/article-service";
import { getAllCategories } from "@/features/category/services/category-service";
import { ArticleCard } from "@/features/article/components/ArticleCard";
import { ArticleFilters } from "@/components/common/ArticleFilters";
import { Pagination } from "@/components/common/Pagination";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ q?: string; tag?: string; category?: string; sort?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const { q, tag, category, sort, page } = params;
  const currentPage = Math.max(1, parseInt(page || "1", 10));

  const [result, popularTags, categories] = await Promise.all([
    tag
      ? searchArticles({ keyword: q, tag, categorySlug: category, page: currentPage })
      : getPublishedArticles({ search: q, categorySlug: category, sort, page: currentPage }),
    getPopularTags(),
    getAllCategories(),
  ]);

  return (
    <div className="container max-w-6xl pb-8">
      <h1 className="text-2xl font-bold mb-6">検索</h1>

      <ArticleFilters categories={categories} basePath="/search" />

      <div className="mb-6 flex flex-wrap gap-2">
        {popularTags.map((popularTag) => (
          <Link key={popularTag.id} href={`/tags/${popularTag.name}`}>
            <Badge variant="outline">
              {popularTag.name} ({popularTag._count.articles})
            </Badge>
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-4">{result.total}件の記事</p>

      {result.articles.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          記事が見つかりませんでした
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination
            currentPage={result.currentPage}
            totalPages={result.totalPages}
            basePath="/search"
            searchParams={params as Record<string, string>}
          />
        </>
      )}
    </div>
  );
}
