import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ArticleLoading() {
  return (
    <div className="container max-w-3xl pb-8" aria-label="読み込み中" role="status">
      {/* BackLink */}
      <Skeleton className="mb-4 h-5 w-24" />

      <Card>
        <CardContent className="pt-6">
          {/* サムネイル */}
          <Skeleton className="aspect-video w-full rounded-lg mb-4" />

          {/* カテゴリバッジ */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          {/* タイトル */}
          <Skeleton className="h-9 w-4/5 mb-2" />
          <Skeleton className="h-9 w-3/5 mb-4" />

          {/* 著者・日付 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-28" />
          </div>

          <Separator className="mb-8" />

          {/* 本文 */}
          <div className="space-y-3">
            {[1, 1, 0.85, 1, 0.7, 1, 1, 0.9, 1, 0.6, 1, 0.75].map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: `${w * 100}%` }} />
            ))}
          </div>

          {/* 見出し風 */}
          <Skeleton className="mt-8 mb-4 h-7 w-2/5" />
          <div className="space-y-3">
            {[1, 1, 0.8, 1, 0.65].map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: `${w * 100}%` }} />
            ))}
          </div>

          {/* タグ */}
          <div className="mt-8 flex flex-wrap gap-2">
            {[14, 18, 12, 20].map((w, i) => (
              <Skeleton key={i} className="h-5 rounded-full" style={{ width: `${w * 4}px` }} />
            ))}
          </div>

          <Separator className="my-8" />

          {/* リアクション・共有ボタン */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-16 rounded-full" />
              ))}
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>

          <Separator className="my-8" />

          {/* コメントセクション */}
          <div className="space-y-6">
            <Skeleton className="h-6 w-28" />

            {/* コメント入力欄 */}
            <Skeleton className="h-20 w-full rounded-md" />
            <div className="flex justify-end">
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>

            {/* コメント一覧 */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2 items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <span className="sr-only">読み込み中...</span>
    </div>
  );
}
