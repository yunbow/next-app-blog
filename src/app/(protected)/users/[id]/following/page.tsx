import { notFound } from "next/navigation";
import { getUserById, getFollowing } from "@/features/user/services/user-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackLink } from "@/components/common/BackLink";
import { Pagination } from "@/components/common/Pagination";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils/image-url";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function FollowingPage({ params, searchParams }: Props) {
  const [{ id }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const page = Math.max(1, Number(pageParam) || 1);

  const user = await getUserById(id);
  if (!user) notFound();

  const { following, totalPages } = await getFollowing(id, page);

  return (
    <div className="container max-w-2xl pb-8">
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
      <Pagination currentPage={page} totalPages={totalPages} basePath={`/users/${id}/following`} />
    </div>
  );
}
