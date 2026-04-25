"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { followAction, unfollowAction } from "../server/social-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils/image-url";

type Props = {
  user: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
    bio: string | null;
    _count: { articles: number; followers: number; following: number };
  };
  isFollowing: boolean;
};

export function ProfileHeader({ user, isFollowing: initialIsFollowing }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const isOwn = session?.user?.id === user.id;

  const handleFollow = async () => {
    setIsLoading(true);
    const result = following ? await unfollowAction(user.id) : await followAction(user.id);
    if (result.success) {
      setFollowing(!following);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="mb-8">
      <div className="flex items-start gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={getImageUrl(user.image)} />
          <AvatarFallback className="text-2xl">{user.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{user.name || "名前未設定"}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
            {session?.user && !isOwn && (
              <Button onClick={handleFollow} disabled={isLoading} variant={following ? "outline" : "default"} size="sm">
                {following ? "フォロー中" : "フォロー"}
              </Button>
            )}
            {isOwn && (
              <Link href="/settings/profile">
                <Button variant="outline" size="sm">プロフィール編集</Button>
              </Link>
            )}
          </div>
          {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
          <div className="flex gap-4 mt-3 text-sm">
            <span><strong>{user._count.articles}</strong> 記事</span>
            <Link href={`/users/${user.id}/followers`} className="hover:underline"><strong>{user._count.followers}</strong> フォロワー</Link>
            <Link href={`/users/${user.id}/following`} className="hover:underline"><strong>{user._count.following}</strong> フォロー中</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
