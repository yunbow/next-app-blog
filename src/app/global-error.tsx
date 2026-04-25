"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-4xl font-bold">エラーが発生しました</h1>
          <p className="text-lg text-muted-foreground">
            予期しないエラーが発生しました。しばらくしてからもう一度お試しください。
          </p>
          {error.digest && (
            <p className="text-sm text-muted-foreground">
              エラーコード: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            もう一度試す
          </button>
        </div>
      </body>
    </html>
  );
}
