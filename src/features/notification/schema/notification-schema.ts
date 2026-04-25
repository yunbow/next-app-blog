import { z } from "zod";

export const NotificationIdSchema = z.string().min(1, "通知IDは必須です");

export type NotificationId = z.infer<typeof NotificationIdSchema>;
