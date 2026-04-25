import { getArticlesByTag } from "@/features/search/services/search-service";
import { ArticleList } from "@/features/article/components/ArticleList";
import { BackLink } from "@/components/common/BackLink";

type Props = {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function TagPage({ params, searchParams }: Props) {
  const { tag } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const tagName = decodeURIComponent(tag);

  const result = await getArticlesByTag(tagName, currentPage);

  return (
    <div className="container max-w-6xl pb-8">
      <BackLink href="/search" label="検索に戻る" />
      <h1 className="text-2xl font-bold mb-6">タグ: {tagName}</h1>
      <ArticleList
        articles={result.articles}
        totalPages={result.totalPages}
        currentPage={result.currentPage}
        basePath={`/tags/${tag}`}
      />
    </div>
  );
}
