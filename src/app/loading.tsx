// Canonical root loading.tsx — Suspense fallback for the app shell.
// Self-contained spinner; no imports outside Tailwind utility classes so the
// file is safe to drop into any app regardless of its component library
// maturity. Replace with an app-specific skeleton when you want a tighter
// CLS profile for your particular landing page.
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="container mx-auto max-w-2xl py-12 flex items-center justify-center"
    >
      <div
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"
      />
      <span className="sr-only">読み込み中...</span>
    </div>
  );
}
