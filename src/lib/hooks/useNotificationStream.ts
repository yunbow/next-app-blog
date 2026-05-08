"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";

type Notification = {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  actor: { id: string; name: string | null; image: string | null; username: string };
  articleId?: string;
};

export function useNotificationStream() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Fetch initial unread count
    fetch("/api/notifications/unread-count")
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.count || 0))
      .catch(() => {});

    // SSE connection - only if endpoint exists
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource("/api/notifications/stream");
      eventSourceRef.current = eventSource;

      eventSource.addEventListener("notification", (event) => {
        const notification = JSON.parse(event.data);
        setLatestNotification(notification);
      });

      eventSource.addEventListener("unread-count", (event) => {
        const data = JSON.parse(event.data);
        setUnreadCount(data.count);
      });

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
        }
        if (eventSourceRef.current === eventSource) {
          eventSourceRef.current = null;
        }
      };
    } catch {
      // SSE not supported or endpoint doesn't exist
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      eventSourceRef.current = null;
    };
  }, [session?.user?.id]);

  return { unreadCount, latestNotification };
}
