import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="読み込み中"
      className="container mx-auto max-w-2xl py-12 space-y-4"
    >
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <span className="sr-only">読み込み中...</span>
    </div>
  );
}
