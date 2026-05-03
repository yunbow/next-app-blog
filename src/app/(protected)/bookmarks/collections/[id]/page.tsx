import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/features/article/components/ArticleCard";
import { BackLink } from "@/components/common/BackLink";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CollectionDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const collection = await prisma.bookmarkCollection.findUnique({
    where: { id },
    include: {
      bookmarks: {
        include: {
          article: {
            include: {
              author: { select: { id: true, name: true, image: true, username: true } },
              category: { select: { id: true, name: true, slug: true } },
              tags: { include: { tag: { select: { id: true, name: true } } } },
              _count: { select: { comments: true, reactions: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { bookmarks: true } },
    },
  });

  if (!collection) {
    notFound();
  }

  // Check if user owns this collection or if it's public
  if (collection.userId !== session.user.id && !collection.isPublic) {
    redirect("/bookmarks");
  }

  const isOwner = collection.userId === session.user.id;

  return (
    <div className="container max-w-6xl pb-8">
      <BackLink href="/bookmarks" label="ブックマークに戻る" />
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          {collection.description && (
            <p className="text-muted-foreground mt-2">{collection.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {collection._count.bookmarks}件の記事 • {collection.isPublic ? "公開" : "非公開"}
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Link href={`/bookmarks/collections/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                編集
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
          </div>
        )}
      </div>

      {collection.bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">このコレクションにはまだ記事がありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.bookmarks.map((bookmark) => (
            <ArticleCard key={bookmark.id} article={bookmark.article} />
          ))}
        </div>
      )}
    </div>
  );
}
