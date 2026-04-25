"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { markAsReadAction, markAllAsReadAction } from "../server/notification-actions";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils/image-url";

type Notification = {
  id: string;
  type: string;
  read: boolean;
  createdAt: Date;
  articleId: string | null;
  actor: { id: string; name: string | null; image: string | null; username: string };
  article: { slug: string; title: string } | null;
};

type Props = { notifications: Notification[] };

const typeLabels: Record<string, string> = {
  follow: "があなたをフォローしました",
  reaction: "があなたの記事にリアクションしました",
  comment: "があなたの記事にコメントしました",
};

export function NotificationList({ notifications }: Props) {
  const router = useRouter();

  const handleMarkAllAsRead = async () => {
    await markAllAsReadAction();
    router.refresh();
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsReadAction(notification.id);
    }
    
    // Navigate to the appropriate page
    if (notification.article?.slug) {
      router.push(`/articles/${notification.article.slug}`);
    } else if (notification.type === "follow") {
      router.push(`/users/${notification.actor.id}`);
    }
  };

  return (
    <div>
      {notifications.length > 0 && (
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            すべて既読にする
          </Button>
        </div>
      )}
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors",
              !n.read && "bg-accent/50"
            )}
            onClick={() => handleNotificationClick(n)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={getImageUrl(n.actor.image)} />
              <AvatarFallback>{n.actor.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">
                  {n.actor.name || "名前未設定"}
                </span>
                {typeLabels[n.type] || ""}
              </p>
              {n.article && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  「{n.article.title}」
                </p>
              )}
              <p className="text-xs text-muted-foreground">{format(n.createdAt, "yyyy/MM/dd HH:mm")}</p>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">通知はありません</p>
        )}
      </div>
    </div>
  );
}
