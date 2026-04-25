import { notFound } from "next/navigation";
import { getUserById, getFollowing } from "@/features/user/services/user-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackLink } from "@/components/common/BackLink";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils/image-url";

type Props = { params: Promise<{ id: string }> };

export default async function FollowingPage({ params }: Props) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  const following = await getFollowing(id);

  return (
    <div className="container max-w-2xl py-8">
      <BackLink href={`/users/${id}`} label="プロフィールに戻る" />
      <h1 className="text-2xl font-bold mb-6">{user.name}がフォロー中</h1>
      <div className="space-y-3">
        {following.map((u) => (
          <Link key={u.id} href={`/users/${u.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
            <Avatar>
              <AvatarImage src={getImageUrl(u.image)} />
              <AvatarFallback>{u.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{u.name || "名前未設定"}</p>
              <p className="text-sm text-muted-foreground">@{u.username}</p>
            </div>
          </Link>
        ))}
        {following.length === 0 && <p className="text-muted-foreground">フォローしているユーザーはいません</p>}
      </div>
    </div>
  );
}
