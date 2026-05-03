import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/features/article/components/ArticleCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [bookmarks, collections] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId: session.user.id },
      include: {
        article: {
          include: {
            author: { select: { id: true, name: true, image: true, username: true } },
            category: { select: { id: true, name: true, slug: true } },
            tags: { include: { tag: { select: { id: true, name: true } } } },
            _count: { select: { comments: true, reactions: true } },
          },
        },
        collection: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bookmarkCollection.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { bookmarks: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="container max-w-6xl pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ブックマーク</h1>
        <Link href="/bookmarks/collections/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            コレクション作成
          </Button>
        </Link>
      </div>

      {collections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">コレクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/bookmarks/collections/${collection.id}`}
                className="p-4 border rounded-lg bg-card hover:bg-accent transition-colors"
              >
                <h3 className="font-medium">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {collection.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {collection._count.bookmarks}件の記事
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">すべてのブックマーク</h2>
        {bookmarks.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            ブックマークはまだありません
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <ArticleCard key={bookmark.id} article={bookmark.article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
