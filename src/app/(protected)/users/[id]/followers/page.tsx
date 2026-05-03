import { notFound } from "next/navigation";
import { getUserById, getFollowers } from "@/features/user/services/user-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackLink } from "@/components/common/BackLink";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils/image-url";

type Props = { params: Promise<{ id: string }> };

export default async function FollowersPage({ params }: Props) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  const followers = await getFollowers(id);

  return (
    <div className="container max-w-2xl pb-8">
      <BackLink href={`/users/${id}`} label="プロフィールに戻る" />
      <h1 className="text-2xl font-bold mb-6">{user.name}のフォロワー</h1>
      <div className="space-y-3">
        {followers.map((follower) => (
          <Link key={follower.id} href={`/users/${follower.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
            <Avatar>
              <AvatarImage src={getImageUrl(follower.image)} />
              <AvatarFallback>{follower.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{follower.name || "名前未設定"}</p>
              <p className="text-sm text-muted-foreground">@{follower.username}</p>
            </div>
          </Link>
        ))}
        {followers.length === 0 && <p className="text-muted-foreground">フォロワーはいません</p>}
      </div>
    </div>
  );
}
