import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserById, isFollowing } from "@/features/user/services/user-service";
import { ProfileHeader } from "@/features/user/components/ProfileHeader";
import { getUserArticles } from "@/features/article/services/article-service";
import { ArticleCard } from "@/features/article/components/ArticleCard";
import { Card, CardContent } from "@/components/ui/card";

type Props = { params: Promise<{ id: string }> };

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  const [user, session] = await Promise.all([getUserById(id), auth()]);

  if (!user) notFound();

  const isFollowingUser = session?.user?.id ? await isFollowing(session.user.id, user.id) : false;
  const { articles } = await getUserArticles(user.id, { status: "published" });

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardContent className="pt-6">
          <ProfileHeader user={user} isFollowing={isFollowingUser} />
          <h2 className="text-xl font-semibold mb-4">記事</h2>
          {articles.length === 0 ? (
            <p className="text-muted-foreground">記事はまだありません</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={{
                    ...article,
                    tags: article.tags || [],
                    _count: article._count || { comments: 0, reactions: 0 }
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
