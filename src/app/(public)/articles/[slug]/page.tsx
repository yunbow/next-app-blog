import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getArticleBySlug } from "@/features/article/services/article-service";
import { prisma } from "@/lib/prisma";
import { getReactionStats, getUserReactions } from "@/features/reaction/server/reaction-actions";
import { ArticleContent } from "@/features/article/components/ArticleContent";
import { CommentSection } from "@/features/comment/components/CommentSection";
import { ReactionPicker } from "@/features/reaction/components/ReactionPicker";
import { ShareButtons } from "@/features/article/components/ShareButtons";
import { ExportButtons } from "@/features/export/components/ExportButtons";
import { BookmarkButton } from "@/features/bookmark/components/BookmarkButton";
import { BackLink } from "@/components/common/BackLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils/image-url";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const [article, session] = await Promise.all([
    getArticleBySlug(slug),
    auth(),
  ]);

  if (!article || article.status !== "published") {
    notFound();
  }

  const [reactionStats, userReactions, comments, bookmarkData, collections] = await Promise.all([
    getReactionStats(article.id),
    session?.user?.id ? getUserReactions(article.id, session.user.id) : Promise.resolve([]),
    prisma.comment.findMany({
      where: { articleId: article.id },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
      },
    }),
    session?.user?.id
      ? prisma.bookmark.findUnique({
          where: {
            userId_articleId: {
              userId: session.user.id,
              articleId: article.id,
            },
          },
          select: {
            id: true,
            collectionId: true,
          },
        })
      : Promise.resolve(null),
    session?.user?.id
      ? prisma.bookmarkCollection.findMany({
          where: { userId: session.user.id },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const isAuthor = session?.user?.id === article.authorId;

  return (
    <div className="container max-w-3xl py-8">
      <BackLink href="/" label="ホームに戻る" />
      <Card>
        <CardContent className="pt-6">
      {article.thumbnail && (
        <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
          <Image
            src={getImageUrl(article.thumbnail) || article.thumbnail}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            className="object-cover"
          />
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {article.category && (
          <Link href={`/categories/${article.category.slug}`}>
            <Badge variant="secondary">{article.category.name}</Badge>
          </Link>
        )}
</div>

      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

      <div className="flex items-center gap-4 mb-6">
        <Link href={`/users/${article.author.id}`} className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getImageUrl(article.author.image)} />
            <AvatarFallback>{article.author.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{article.author.name || "名前未設定"}</p>
            <p className="text-sm text-muted-foreground">@{article.author.username}</p>
          </div>
        </Link>
        {article.publishedAt && (
          <span className="text-sm text-muted-foreground">
            {format(article.publishedAt, "yyyy年MM月dd日")}
          </span>
        )}
      </div>

      <Separator className="mb-8" />

      <ArticleContent content={article.content} />

      {article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map(({ tag }) => (
            <Link key={tag.id} href={`/tags/${tag.name}`}>
              <Badge variant="outline">{tag.name}</Badge>
            </Link>
          ))}
        </div>
      )}

      <Separator className="my-8" />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <ReactionPicker
          articleId={article.id}
          stats={reactionStats}
          userReactions={userReactions}
        />
        <div className="flex items-center gap-2">
          {session?.user && (
            <BookmarkButton 
              articleId={article.id} 
              isBookmarked={!!bookmarkData}
              bookmarkId={bookmarkData?.id}
              currentCollectionId={bookmarkData?.collectionId}
              collections={collections}
            />
          )}
          <ShareButtons url={`/articles/${article.slug}`} title={article.title} />
        </div>
      </div>

      {isAuthor && (
        <div className="mt-4">
          <ExportButtons articleId={article.id} />
        </div>
      )}

      <Separator className="my-8" />

      <CommentSection articleId={article.id} comments={comments} />
        </CardContent>
      </Card>
    </div>
  );
}
