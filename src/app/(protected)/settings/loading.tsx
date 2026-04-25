import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="読み込み中" className="container max-w-2xl pb-6 space-y-6">
      <Skeleton className="h-8 w-24" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        ))}
      </div>
      <span className="sr-only">読み込み中...</span>
    </div>
  );
}
