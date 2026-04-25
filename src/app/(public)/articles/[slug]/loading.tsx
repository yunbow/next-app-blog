export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
      <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        <div className="space-y-1">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
