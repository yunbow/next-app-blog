import { getPublishedArticles } from "@/features/article/services/article-service";
import { getAllCategories } from "@/features/category/services/category-service";
import { ArticleCard } from "@/features/article/components/ArticleCard";
import { ArticleFilters } from "@/components/common/ArticleFilters";
import { Pagination } from "@/components/common/Pagination";

type Props = {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
};

export default async function ArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  
  const [result, categories] = await Promise.all([
    getPublishedArticles({
      search: params.q,
      categorySlug: params.category,
      sort: params.sort,
      page,
    }),
    getAllCategories(),
  ]);

  return (
    <div className="container max-w-6xl pb-8">
      <h1 className="text-2xl font-bold mb-6">最新の記事</h1>
      
      <ArticleFilters
        categories={categories}
        basePath="/articles"
      />

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
            basePath="/articles"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}
