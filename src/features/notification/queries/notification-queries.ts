import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAsReadAction, markAllAsReadAction } from "../server/notification-actions";

// Query Keys
export const notificationKeys = {
  all: ["notifications"] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

// Mutations
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await markAsReadAction(notificationId);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await markAllAsReadAction();
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}
