import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/features/category/services/category-service";
import { getArticlesByCategory } from "@/features/search/services/search-service";
import { ArticleList } from "@/features/article/components/ArticleList";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const result = await getArticlesByCategory(slug, currentPage);

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-2xl font-bold mb-6">カテゴリ: {category.name}</h1>
      <ArticleList
        articles={result.articles}
        totalPages={result.totalPages}
        currentPage={result.currentPage}
        basePath={`/categories/${slug}`}
      />
    </div>
  );
}
