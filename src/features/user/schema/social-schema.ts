import { z } from "zod";

export const FollowUserSchema = z.object({
  userId: z.string().min(1, "ユーザーIDは必須です"),
});

export type FollowUserInput = z.infer<typeof FollowUserSchema>;
